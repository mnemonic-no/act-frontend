import * as d3 from 'd3';
import { isBefore } from 'date-fns';
import { action, computed, observable, reaction } from 'mobx';
import * as _ from 'lodash/fp';

import { isRetracted, isRetraction } from '../core/domain';
import { ActFact, ActObject, QueryResult } from './types';
import MainPageStore from './MainPageStore';
import { relativeStringToDate } from '../components/RelativeDateSelector';
import { factMapToObjectMap, factsToObjects } from '../core/transformers';
import { setUnion } from '../util/util';

export type ObjectTypeFilter = {
  id: string;
  name: string;
  checked: boolean;
};

export const filterByTime = (facts: { [id: string]: ActFact }, endTimestamp: Date | string) => {
  if (endTimestamp !== 'Any time') {
    const factEndTimeDate = relativeStringToDate(endTimestamp);
    return _.pickBy((fact: ActFact) => isBefore(new Date(fact.timestamp), factEndTimeDate))(facts);
  }
  return facts;
};

export const filterByObjectTypes = (facts: { [id: string]: ActFact }, objectTypeFilters: Array<ObjectTypeFilter>) => {
  const excludedObjectTypeIds = Object.values(objectTypeFilters)
    .filter(({ checked }) => !checked)
    .map(({ id }) => id);

  return _.pickBy((fact: ActFact) => {
    return factsToObjects([fact]).every((object: ActObject) => !excludedObjectTypeIds.includes(object.type.id));
  })(facts);
};

export const filterByPrunedObjects = (facts: { [id: string]: ActFact }, prunedObjectIds: Set<string>) => {
  return _.pickBy((fact: ActFact) => {
    return factsToObjects([fact]).every((object: ActObject) => {
      return !prunedObjectIds.has(object.id);
    });
  })(facts);
};

export const handleRetractions = (facts: { [id: string]: ActFact }, showRetractions: boolean) => {
  return showRetractions ? facts : _.omitBy((f: ActFact) => isRetraction(f) || isRetracted(f))(facts);
};

export const refineResult = (
  queryResult: QueryResult,
  objectTypeFilters: Array<ObjectTypeFilter>,
  endTimestamp: Date | string,
  showRetractions: boolean,
  prunedObjectIds: Set<string>
): QueryResult => {
  const filteredFacts = _.pipe(
    facts => handleRetractions(facts, showRetractions),
    facts => filterByObjectTypes(facts, objectTypeFilters),
    facts => filterByPrunedObjects(facts, prunedObjectIds),
    facts => filterByTime(facts, endTimestamp)
  )(queryResult.facts);

  let filteredObjects = factMapToObjectMap(filteredFacts);

  return { facts: filteredFacts, objects: filteredObjects };
};

class RefineryStore {
  root: MainPageStore;

  @observable prunedObjectIds: Set<string> = new Set();
  @observable objectTypeFilters: Array<ObjectTypeFilter> = [];
  @observable endTimestamp: Date | string = 'Any time';

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
    return refineResult(
      this.root.queryHistory.result,
      this.objectTypeFilters,
      this.endTimestamp,
      this.root.ui.refineryOptionsStore.graphOptions.showRetractions,
      this.prunedObjectIds
    );
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
    return [...this.prunedObjectIds].map((objectId: string) => {
      return this.root.queryHistory.result.objects[objectId];
    });
  }
}

export default RefineryStore;
