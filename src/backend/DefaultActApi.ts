import { ActApi } from './ActApi';
import {
  ActFact,
  ActObject,
  FactComment,
  FactType,
  ObjectFactsSearch,
  ObjectTraverseSearch,
  SearchResult,
  TConfig
} from '../core/types';

import {
  autoResolveDataLoader,
  checkObjectStats,
  createFact,
  objectDataLoader,
  objectFactsDataLoader,
  objectKeywordSearch,
  objectTraverseDataLoader,
  objectTypesDataLoader,
  metaFactsDataLoader,
  multiObjectTraverseDataLoader,
  factByIdDataLoader,
  factCommentsDataLoader,
  factDataLoader,
  factKeywordSearch,
  factTypesDataLoader,
  factTypesToResolveByObjectId,
  postJson,
  retractFact } from './dataLoaders';
import wretch, { Wretcher } from 'wretch';

export class DefaultActApi implements ActApi {

  wretcher: Wretcher;

  constructor(config: TConfig) {
    this.wretcher = wretch()
      .url(config.apiUrl)
      .options({ mode: 'cors', credentials: 'include' })
      .headers({
        'ACT-User-ID': config.actUserId,
        Accept: 'application/json'
      })
      .errorType('json');
  }

  autoResolveDataLoader(args: { facts: { [p: string]: ActFact }; objects: { [p: string]: ActObject } }, config: TConfig): Promise<{ facts: Record<string, ActFact>; objects: Record<string, ActObject> }> {
    return autoResolveDataLoader(this.wretcher, args, config);
  }

  checkObjectStats(search: ObjectFactsSearch, maxCount: number): Promise<boolean> {
    return checkObjectStats(this.wretcher, search, maxCount);
  }

  createFact(request: any): Promise<any> {
    return createFact(this.wretcher, request);
  }

  factByIdDataLoader(args: { id: string }): Promise<ActFact> {
    return factByIdDataLoader(this.wretcher, args);
  }

  factCommentsDataLoader(args: { id: string }): Promise<Array<FactComment>> {
    return factCommentsDataLoader(this.wretcher, args);
  }

  factDataLoader(objectId: string, factTypes: Array<string>): Promise<Array<ActFact>> {
    return factDataLoader(this.wretcher, objectId, factTypes)
  }

  factKeywordSearch(args: { keywords: string; factTypes: Array<string>; objectTypes: Array<string>; limit: number }): Promise<Array<ActFact>> {
    return factKeywordSearch(this.wretcher, args);
  }

  factTypesDataLoader(): Promise<Array<FactType>> {
    return factTypesDataLoader(this.wretcher)
  }

  factTypesToResolveByObjectId(
    objectTypeToFactTypes: { [p: string]: Array<string> },
    objects: Array<ActObject>
  ): Array<{ objectIds: Array<string>; factTypes: Array<string> }> {
    return factTypesToResolveByObjectId(objectTypeToFactTypes, objects);
  }

  metaFactsDataLoader(props: { id: string }): Promise<Array<ActFact>> {
    return metaFactsDataLoader(this.wretcher, props)
  }

  multiObjectTraverseDataLoader(
    args: { objectIds: Array<string>; query: string },
    abortController?: AbortController
  ): Promise<SearchResult> {
    return multiObjectTraverseDataLoader(this.wretcher, args, abortController)
  }

  objectDataLoader(objectTypeName: string, objectValue: string): Promise<any> {
    return objectDataLoader(this.wretcher, objectTypeName, objectValue);
  }

  objectFactsDataLoader(search: ObjectFactsSearch, abortController?: AbortController): Promise<SearchResult> {
    return objectFactsDataLoader(this.wretcher, search, abortController);
  }

  objectKeywordSearch(args: { keywords: string; objectTypes: Array<string>; limit: number }): Promise<Array<ActObject>> {
    return objectKeywordSearch(this.wretcher, args);
  }

  objectTraverseDataLoader(search: ObjectTraverseSearch, abortController?: AbortController): Promise<SearchResult> {
    return objectTraverseDataLoader(this.wretcher, search, abortController);
  }

  objectTypesDataLoader(): Promise<{ objectTypes: any }> {
    return objectTypesDataLoader(this.wretcher);
  }

  postJson(url: string, jsonRequest: any): Promise<any> {
    return postJson(this.wretcher, url, jsonRequest);
  }

  retractFact(fact: ActFact, comment: string, accessMode: string): Promise<any> {
    return retractFact(this.wretcher, fact, comment, accessMode)
  }
}
