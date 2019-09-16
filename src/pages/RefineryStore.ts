import * as d3 from 'd3';
import { isBefore } from 'date-fns';
import { action, computed, observable, reaction } from 'mobx';
import * as _ from 'lodash/fp';

import { isRetracted, isRetraction, objectIdToFacts } from '../core/domain';
import { ActFact, ActObject, ObjectTypeFilter, QueryResult } from './types';
import MainPageStore from './MainPageStore';
import { relativeStringToDate } from '../components/RelativeDateSelector';
import { factMapToObjectMap, factsToObjects, isOneLegged } from '../core/transformers';
import { setUnion } from '../util/util';

export const filterByTime = (facts: { [id: string]: ActFact }, endTimestamp: Date | string) => {
  if (endTimestamp !== 'Any time') {
    const factEndTimeDate = relativeStringToDate(endTimestamp);
    return _.pickBy((fact: ActFact) => isBefore(new Date(fact.timestamp), factEndTimeDate))(facts);
  }
  return facts;
};

export const filterFactsByObjectTypes = (
  facts: { [id: string]: ActFact },
  objectTypeFilters: Array<ObjectTypeFilter>
) => {
  const excludedObjectTypeIds = Object.values(objectTypeFilters)
    .filter(({ checked }) => !checked)
    .map(({ id }) => id);

  return _.pickBy((fact: ActFact) => {
    return factsToObjects([fact]).every((object: ActObject) => !excludedObjectTypeIds.includes(object.type.id));
  })(facts);
};

export const filterFactsByPrunedObjects = (facts: { [id: string]: ActFact }, prunedObjectIds: Set<string>) => {
  return _.pickBy((fact: ActFact) => {
    return factsToObjects([fact]).every((object: ActObject) => !prunedObjectIds.has(object.id));
  })(facts);
};

export const filterObjectsByObjectTypes = (
  objects: { [id: string]: ActObject },
  objectTypeFilters: Array<ObjectTypeFilter>
) => {
  const excludedObjectTypeIds = Object.values(objectTypeFilters)
    .filter(({ checked }) => !checked)
    .map(({ id }) => id);

  return _.pickBy((object: ActObject) => !excludedObjectTypeIds.includes(object.type.id))(objects);
};

export const filterOrphans = (
  objects: { [id: string]: ActObject },
  facts: { [id: string]: ActFact },
  showOrphans: boolean
) => {
  if (showOrphans) {
    return objects;
  }

  // Only care about two-legged facts since we are removing orphans
  const objIdToFacts = objectIdToFacts(Object.values(facts).filter(f => !isOneLegged(f)));
  const withoutOrphans = _.pickBy((o: ActObject) => Boolean(objIdToFacts[o.id] && objIdToFacts[o.id].length > 0));
  return withoutOrphans(objects);
};

export const handleRetractions = (facts: { [id: string]: ActFact }, showRetractions: boolean) => {
  return showRetractions ? facts : _.omitBy((f: ActFact) => isRetraction(f) || isRetracted(f))(facts);
};

interface IRefineResult {
  queryResult: QueryResult;
  objectTypeFilters: Array<ObjectTypeFilter>;
  endTimestamp: Date | string;
  prunedObjectIds: Set<string>;
  showRetractions?: boolean;
  showOrphans?: boolean;
}

export const refineResult = ({
  queryResult,
  objectTypeFilters,
  endTimestamp,
  prunedObjectIds,
  showRetractions = true,
  showOrphans = true
}: IRefineResult): QueryResult => {
  const refinedFacts = _.pipe(
    facts => handleRetractions(facts, showRetractions),
    facts => filterFactsByObjectTypes(facts, objectTypeFilters),
    facts => filterFactsByPrunedObjects(facts, prunedObjectIds),
    facts => filterByTime(facts, endTimestamp)
  )(queryResult.facts);

  let objectsFromFacts = factMapToObjectMap(refinedFacts);

  let refinedObjects = _.pipe(
    objects => filterObjectsByObjectTypes(objects, objectTypeFilters),
    objects => _.pickBy((object: ActObject) => !prunedObjectIds.has(object.id))(objects),
    objects => {
      return { ...objects, ...objectsFromFacts };
    },
    objects => filterOrphans(objects, refinedFacts, showOrphans)
  )(queryResult.objects);

  return { facts: refinedFacts, objects: refinedObjects };
};

class RefineryStore {
  root: MainPageStore;

  @observable prunedObjectIds: Set<string> = new Set();
  @observable objectTypeFilters: Array<ObjectTypeFilter> = [];
  @observable endTimestamp: Date | string = 'Any time';
  @observable showOrphans = true;

  constructor(root: MainPageStore) {
    this.root = root;

    reaction(
      () => this.root.queryHistory.result.objects,
      resultObjects => {
        if (Object.values(resultObjects).length === 0) {
          this.objectTypeFilters = [];
          return;
        }

        const uniqueObjectTypes = _.uniqBy((x: ActObject) => x.type.id)(Object.values(resultObjects));

        uniqueObjectTypes
          // Only add new ones
          .filter(x => !this.objectTypeFilters.some(y => x.type.id === y.id))
          .map(x => x.type)
          .forEach(x => {
            // @ts-ignore
            this.objectTypeFilters.push({ ...x, checked: true });
          });
      }
    );
  }

  @computed get refined(): QueryResult {
    return refineResult({
      queryResult: this.root.queryHistory.result,
      objectTypeFilters: this.objectTypeFilters,
      endTimestamp: this.endTimestamp,
      prunedObjectIds: this.prunedObjectIds,
      showRetractions: this.root.ui.refineryOptionsStore.graphOptions.showRetractions,
      showOrphans: this.showOrphans
    });
  }

  @action
  setEndTimestamp(newEnd: Date) {
    this.endTimestamp = newEnd;
  }

  @action
  toggleObjectTypeFilter(x: ObjectTypeFilter) {
    x.checked = !x.checked;
  }

  @computed
  get timeRange(): [Date, Date] {
    const res: QueryResult = this.refined;

    const facts = Object.values(res.facts);

    if (facts.length === 0) {
      const now = new Date();
      return [d3.timeMonth.floor(now), d3.timeMonth.ceil(now)];
    }

    // @ts-ignore
    const earliest = new Date(_.minBy(x => x.timestamp)(facts).timestamp);
    // @ts-ignore
    const latest = new Date(_.maxBy(x => x.timestamp)(facts).timestamp);
    return [earliest, latest];
  }

  @action.bound
  addToPrunedObjectIds(prune: Array<string>) {
    this.prunedObjectIds = setUnion(this.prunedObjectIds, new Set(prune));
  }

  @action.bound
  setPrunedObjectIds(prune: Array<string>) {
    this.prunedObjectIds = new Set(prune);
  }

  @action.bound
  clearPrunedObjectIds() {
    this.prunedObjectIds = new Set();
  }

  @action.bound
  unpruneObjectId(id: string) {
    this.prunedObjectIds.delete(id);
  }

  @computed
  get prunedObjects(): Array<ActObject> {
    return [...this.prunedObjectIds]
      .map((objectId: string) => {
        return this.root.queryHistory.result.objects[objectId];
      })
      .filter(x => x);
  }

  @action.bound
  toggleShowOrphans() {
    this.showOrphans = !this.showOrphans;
  }
}

export default RefineryStore;
