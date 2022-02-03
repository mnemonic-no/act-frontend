import { observable } from 'mobx';

import { ActFact, ActObject, isRejected, LoadingStatus, TConfig, TRequestLoadable } from '../core/types';
import { autoResolveFactsFor } from '../configUtil';
import { ActApi } from './ActApi';

export type ActObjectSearch = TRequestLoadable<
  { objectValue: string; objectTypeName: string },
  { actObject: ActObject; facts: Array<ActFact> }
>;

const actObjectSearchId = (props: { objectValue: string; objectTypeName: string }) =>
  props.objectTypeName + props.objectValue;

class ActObjectBackendStore {
  @observable actObjectSearches: { [id: string]: ActObjectSearch } = {};

  config: TConfig;
  actApi: ActApi;

  constructor(config: TConfig, actApi: ActApi) {
    this.config = config;
    this.actApi = actApi;
  }

  async execute(objectValue: string, objectTypeName: string, onError?: (error: Error) => void) {
    const s: ActObjectSearch = {
      id: actObjectSearchId({ objectValue: objectValue, objectTypeName: objectTypeName }),
      args: { objectValue: objectValue, objectTypeName: objectTypeName },
      status: LoadingStatus.PENDING
    };

    if (this.includes(s) && !isRejected(this.actObjectSearches[s.id])) {
      return;
    }

    this.actObjectSearches[s.id] = s;

    try {
      const object = await this.actApi.objectDataLoader(objectTypeName, objectValue);

      // Autoresolve facts for this object
      let facts: Array<ActFact> = [];
      const factTypesToAutoResolve = autoResolveFactsFor(objectTypeName, this.config);
      if (factTypesToAutoResolve) {
        facts = await this.actApi.factDataLoader(object.id, factTypesToAutoResolve);
      }

      this.actObjectSearches[s.id] = { ...s, status: LoadingStatus.DONE, result: { actObject: object, facts: facts } };
    } catch (err) {
      if (onError) onError(err as Error);
      this.actObjectSearches[s.id] = { ...s, status: LoadingStatus.REJECTED, error: (err as Error)?.message };
    }
  }

  getActObjectSearch(objectValue: string, objectTypeName: string) {
    return this.actObjectSearches[actObjectSearchId({ objectValue: objectValue, objectTypeName: objectTypeName })];
  }

  includes(s: ActObjectSearch) {
    return this.actObjectSearches.hasOwnProperty(s.id);
  }

  includesActObject(actObject: ActObject) {
    return Boolean(this.getActObjectSearch(actObject.value, actObject.type.name));
  }
}

export default ActObjectBackendStore;
