import * as d3 from 'd3';
import { isBefore } from 'date-fns';
import { action, computed, observable, reaction } from 'mobx';
import * as _ from 'lodash/fp';

import {
  factMapToObjectMap,
  factsToObjects,
  isOneLegged,
  isRetracted,
  isRetraction,
  objectIdToFacts
} from '../../core/domain';
import { ActFact, ActObject, ObjectTypeFilter, SearchResult } from '../../core/types';
import MainPageStore from './MainPageStore';
import { relativeStringToDate } from '../../components/RelativeDateSelector';
import { setUnion } from '../../util/util';

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
  includeOrphans: boolean
) => {
  if (includeOrphans) {
    return objects;
  }

  // Only care about two-legged facts since we are removing orphans
  const objIdToFacts = objectIdToFacts(Object.values(facts).filter(f => !isOneLegged(f)));
  const withoutOrphans = _.pickBy((o: ActObject) => Boolean(objIdToFacts[o.id] && objIdToFacts[o.id].length > 0));
  return withoutOrphans(objects);
};

export const handleRetractions = (facts: { [id: string]: ActFact }, includeRetractions: boolean) => {
  return includeRetractions ? facts : _.omitBy((f: ActFact) => isRetraction(f) || isRetracted(f))(facts);
};

interface IRefineResult {
  searchResult: SearchResult;
  objectTypeFilters: Array<ObjectTypeFilter>;
  endTimestamp: Date | string;
  prunedObjectIds: Set<string>;
  includeRetractions?: boolean;
  includeOrphans?: boolean;
}

export const refineResult = ({
  searchResult,
  objectTypeFilters,
  endTimestamp,
  prunedObjectIds,
  includeRetractions = true,
  includeOrphans = true
}: IRefineResult): SearchResult => {
  const refinedFacts = _.pipe(
    facts => handleRetractions(facts, includeRetractions),
    facts => filterFactsByObjectTypes(facts, objectTypeFilters),
    facts => filterFactsByPrunedObjects(facts, prunedObjectIds),
    facts => filterByTime(facts, endTimestamp)
  )(searchResult.facts);

  let objectsFromFacts = factMapToObjectMap(refinedFacts);

  let refinedObjects = _.pipe(
    objects => filterObjectsByObjectTypes(objects, objectTypeFilters),
    objects => _.pickBy((object: ActObject) => !prunedObjectIds.has(object.id))(objects),
    objects => {
      return { ...objects, ...objectsFromFacts };
    },
    objects => filterOrphans(objects, refinedFacts, includeOrphans)
  )(searchResult.objects);

  return { facts: refinedFacts, objects: refinedObjects };
};

class RefineryStore {
  root: MainPageStore;

  @observable prunedObjectIds: Set<string> = new Set();
  @observable objectTypeFilters: Array<ObjectTypeFilter> = [];
  @observable endTimestamp: Date | string = 'Any time';
  @observable includeOrphans = true;
  @observable includeRetractions = true;

  localStorage: Storage;

  constructor(root: MainPageStore, localStorage: Storage) {
    this.root = root;

    this.localStorage = localStorage;
    this.includeRetractions = Boolean(JSON.parse(localStorage.getItem('options.includeRetractions') || 'true'));
    this.includeOrphans = Boolean(JSON.parse(localStorage.getItem('options.includeOrphans') || 'true'));

    reaction(
      () => this.root.workingHistory.result.objects,
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

  @computed get refined(): SearchResult {
    return refineResult({
      searchResult: this.root.workingHistory.result,
      objectTypeFilters: this.objectTypeFilters,
      endTimestamp: this.endTimestamp,
      prunedObjectIds: this.prunedObjectIds,
      includeRetractions: this.includeRetractions,
      includeOrphans: this.includeOrphans
    });
  }

  @action
  setEndTimestamp(newEnd: Date) {
    this.endTimestamp = newEnd;
  }

  @action.bound
  toggleObjectTypeFilter(x: ObjectTypeFilter) {
    x.checked = !x.checked;
  }

  @computed
  get timeRange(): [Date, Date] {
    const res: SearchResult = this.refined;

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
        return this.root.workingHistory.result.objects[objectId];
      })
      .filter(x => x);
  }

  @action.bound
  toggleIncludeOrphans() {
    this.includeOrphans = !this.includeOrphans;
    this.localStorage.setItem('options.includeOrphans', JSON.stringify(this.includeOrphans));
  }

  @action.bound
  toggleIncludeRetractions() {
    this.includeRetractions = !this.includeRetractions;
    this.localStorage.setItem('options.includeRetractions', JSON.stringify(this.includeRetractions));
  }
}

export default RefineryStore;
