import MainPageStore from './MainPageStore';
import { action, computed, observable, reaction } from 'mobx';
import { factMapToObjectMap, factsToObjects } from '../core/transformers';
import { relativeStringToDate } from '../components/RelativeDateSelector';
import { isBefore } from 'date-fns';
import config from '../config';

import * as R from 'ramda';
import { objectFactsToElements } from '../core/cytoscapeTransformers';
import { ActFact, ActObject, QueryResult } from './types';

export type ObjectTypeFilter = {
  id: string;
  name: string;
  checked: boolean;
};

class RefineryStore {
  root: MainPageStore;

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

        const uniqueObjectTypes = R.uniqBy(x => x.type.id, Object.values(resultObjects));

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

  static refineResult(
    queryResult: QueryResult,
    objectTypeFilters: Array<ObjectTypeFilter>,
    endTimestamp: Date | string,
    showRetractions: boolean
  ): QueryResult {
    // Object type filtering
    const excludedObjectTypeIds = Object.values(objectTypeFilters)
      .filter(({ checked }) => !checked)
      .map(({ id }) => id);

    let filteredFacts: { [id: string]: ActFact } = R.filter((val: ActFact) => {
      return factsToObjects([val]).every((object: any) => !excludedObjectTypeIds.includes(object.type.id));
    }, queryResult.facts);

    let filteredObjects: { [id: string]: ActObject } = R.filter((val: ActObject) => {
      return !excludedObjectTypeIds.includes(val.type.id);
    }, queryResult.objects);

    // Time filter
    if (endTimestamp !== 'Any time') {
      const factEndTimeDate = relativeStringToDate(endTimestamp);

      filteredFacts = R.filter((fact: ActFact) => {
        return isBefore(new Date(fact.timestamp), factEndTimeDate);
      }, filteredFacts);

      filteredObjects = factMapToObjectMap(filteredFacts);
    }

    // Retractions
    const retractions: Array<ActFact> = Object.values(filteredFacts).filter(
      (fact: ActFact) => fact.type.name === 'Retraction'
    );

    const retractedFacts = R.pipe(
      // @ts-ignore
      R.filter((fact: ActFact) => retractions.some((r: ActFact) => fact.id === r.inReferenceTo.id)),
      R.map((fact: ActFact) => ({
        ...fact,
        retracted: true,
        retraction: retractions.find((retraction: any) => fact.id === retraction.inReferenceTo.id)
      }))
    )(filteredFacts);

    const exclude = new Set([
      ...retractions.map((x: ActFact) => x.id),
      ...Object.values(R.map((x: ActFact) => x.id, retractedFacts))
    ]);

    filteredFacts = {
      ...R.filter((fact: any) => !exclude.has(fact.id), filteredFacts),
      ...(showRetractions ? retractedFacts : {})
    };

    return { facts: filteredFacts, objects: filteredObjects };
  }

  @computed get refined(): QueryResult {
    return RefineryStore.refineResult(
      this.root.queryHistory.result,
      this.objectTypeFilters,
      this.endTimestamp,
      this.root.ui.refineryOptionsStore.graphOptions.showRetractions
    );
  }

  @computed get cytoscapeElements() {
    const res: QueryResult = this.refined;

    return objectFactsToElements({
      facts: Object.values(res.facts),
      objects: Object.values(res.objects),
      objectLabelFromFactType: config.objectLabelFromFactType
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
}

export default RefineryStore;
