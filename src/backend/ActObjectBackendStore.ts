import { observable } from 'mobx';

import { ActFact, ActObject, LoadingStatus, TRequestLoadable } from '../core/types';
import { factDataLoader, objectDataLoader } from '../core/dataLoaders';
import config from '../config';
import { autoResolveFactsFor } from '../configUtil';

export type ActObjectSearch = TRequestLoadable<
  { objectValue: string; objectTypeName: string },
  { actObject: ActObject; facts: Array<ActFact> }
>;

const actObjectSearchId = ({ objectValue, objectTypeName }: { objectValue: string; objectTypeName: string }) =>
  objectTypeName + objectValue;

class ActObjectBackendStore {
  @observable actObjectSearches: { [id: string]: ActObjectSearch } = {};

  config: { [any: string]: string };

  constructor(config: { [any: string]: string }) {
    this.config = config;
  }

  async execute(objectValue: string, objectTypeName: string) {
    const s: ActObjectSearch = {
      id: actObjectSearchId({ objectValue: objectValue, objectTypeName: objectTypeName }),
      args: { objectValue: objectValue, objectTypeName: objectTypeName },
      status: LoadingStatus.PENDING
    };

    if (this.includes(s) && this.actObjectSearches[s.id].status !== LoadingStatus.REJECTED) {
      return;
    }

    this.actObjectSearches[s.id] = s;

    try {
      const object = await objectDataLoader(objectTypeName, objectValue);

      // Autoresolve facts for this object
      let facts: Array<ActFact> = [];
      const factTypesToAutoResolve = autoResolveFactsFor(objectTypeName, config);
      if (factTypesToAutoResolve) {
        facts = await factDataLoader(object.id, factTypesToAutoResolve);
      }

      this.actObjectSearches[s.id] = { ...s, status: LoadingStatus.DONE, result: { actObject: object, facts: facts } };
    } catch (err) {
      this.actObjectSearches[s.id] = { ...s, status: LoadingStatus.REJECTED, error: err.message };
    }
  }

  getActObjectSearch(objectValue: string, objectTypeName: string) {
    return this.actObjectSearches[actObjectSearchId({ objectValue: objectValue, objectTypeName: objectTypeName })];
  }

  includes(s: ActObjectSearch) {
    return this.actObjectSearches.hasOwnProperty(s.id);
  }
}

export default ActObjectBackendStore;
