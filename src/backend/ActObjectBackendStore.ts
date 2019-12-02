import { observable } from 'mobx';

import { ActFact, ActObject } from '../core/types';
import { factDataLoader, objectDataLoader } from '../core/dataLoaders';
import config from '../config';

export type ActObjectSearch = {
  id: string;
  objectValue: string;
  objectTypeName: string;
  status: 'pending' | 'rejected' | 'done';
  result?: { actObject: ActObject; facts: Array<ActFact> };
  errorDetails?: string;
};

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
      objectValue: objectValue,
      objectTypeName: objectTypeName,
      status: 'pending'
    };

    if (this.includes(s) && this.actObjectSearches[s.id].status !== 'rejected') {
      return;
    }

    this.actObjectSearches[s.id] = s;

    try {
      const object = await objectDataLoader(objectTypeName, objectValue);

      // Autoresolve facts for this object
      let facts: Array<ActFact> = [];
      if (config.autoResolveFacts && config.autoResolveFacts[objectTypeName]) {
        facts = await factDataLoader(object.id, config.autoResolveFacts[objectTypeName]);
      }

      this.actObjectSearches[s.id] = { ...s, status: 'done', result: { actObject: object, facts: facts } };
    } catch (err) {
      this.actObjectSearches[s.id] = { ...s, status: 'rejected', errorDetails: err.message };
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
