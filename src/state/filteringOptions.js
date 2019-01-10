import { extendObservable, observable, reaction } from 'mobx';
import isBefore from 'date-fns/isBefore';

import dataState, { Data } from './data';
import { factsToObjects } from '../core/transformers';
import { relativeStringToDate } from '../components/RelativeDateSelector';
import graphOptions from './graphOptions'; // TODO: Really shouldn't spagetti twine the stores...

// Store how to filter the act data
class FilteringOptionsStore {
  constructor () {
    extendObservable(
      this,
      {
        startTimestamp: null, // relativeString | date
        endTimestamp: 'Any time', // relativeString | date

        objectTypes: [], // List of objectTypes to include

        mergePrevious: true,

        get excludedObjectTypes () {
          return this.objectTypes
            .filter(({ checked }) => !checked)
            .map(({ id }) => id);
        },

        /*
       * Return a filtered subset of the current data
       * filter on:
       *  - mergePrevious
       *  - fact endTimestamp
       *  - excludedObjectTypes
       */
        get filteredData () {
          // mergePrevious
          const baseData = this.mergePrevious
            ? dataState.current.data
            : dataState.current.itemData;

          let filteredFacts = baseData.factsData;
          let filteredObjects = baseData.objectsData;

          // excludedObjectTypes

          filteredFacts = filteredFacts.filter(fact =>
            factsToObjects([fact]).every(
              object => !this.excludedObjectTypes.includes(object.type.id)
            )
          );
          filteredObjects = filteredObjects.filter(
            object => !this.excludedObjectTypes.includes(object.type.id)
          );

          // Fact timestamp
          if (this.endTimestamp !== 'Any time') {
            const factEndTimeDate = relativeStringToDate(this.endTimestamp);
            filteredFacts = filteredFacts.filter(fact =>
              isBefore(new Date(fact.timestamp), factEndTimeDate)
            );
            filteredObjects = factsToObjects(filteredFacts);
          }

          // Retractions
          const retractions = filteredFacts.filter(
            fact => fact.type.name === 'Retraction'
          );
          const retractedFacts = filteredFacts
            .filter(fact =>
              retractions.some(
                retraction => fact.id === retraction.inReferenceTo.id
              )
            )
            .map(fact => ({
              ...fact,
              retracted: true,
              retraction: retractions.find(
                retraction => fact.id === retraction.inReferenceTo.id
              )
            }));

          const exclude = new Set([
            ...retractions.map(x => x.id),
            ...retractedFacts.map(x => x.id)
          ]);
          filteredFacts = [
            ...filteredFacts.filter(fact => !exclude.has(fact.id)),
            ...(graphOptions.showRetractions ? retractedFacts : [])
          ];
          // TOOD: Remove object that where only visible in the retracted facts

          return new Data({
            factsData: filteredFacts,
            objectsData: filteredObjects
          });
        }
      },
      {
        objectTypes: observable.shallow
      }
    );

    reaction(
      () => dataState.current.objectTypes,
      () => {
        if (dataState.current.objectTypes.length === 0) {
          this.objectTypes = [];
          return;
        }

        dataState.current.objectTypes
          .filter(x => !this.objectTypes.some(y => x.id === y.id))
          .forEach(x => {
            this.objectTypes.push(Object.assign({}, x, { checked: true }));
          });
      }
    );
  }

  setStartTimestamp (value) {
    this.startTimestamp = value;
  }

  setEndTimestamp (value) {
    this.endTimestamp = value;
  }

  setObjectTypes (value) {
    this.objectTypes = value;
  }

  setMergePrevious (value) {
    this.mergePrevious = value;
  }
}

export default new FilteringOptionsStore();
