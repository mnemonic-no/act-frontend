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

export interface ActApi {
  autoResolveDataLoader(
    args: { facts: { [id: string]: ActFact }; objects: { [id: string]: ActObject } },
    config: TConfig
  ): Promise<{ facts: Record<string, ActFact>; objects: Record<string, ActObject> }>;

  checkObjectStats(search: ObjectFactsSearch, maxCount: number): Promise<boolean>;

  createFact(request: any): Promise<any>;

  factByIdDataLoader(args: { id: string }): Promise<ActFact>;

  factCommentsDataLoader(args: { id: string }): Promise<Array<FactComment>>;

  factDataLoader(objectId: string, factTypes: Array<string>): Promise<Array<ActFact>>;

  factKeywordSearch(args: {
    keywords: string;
    factTypes: Array<string>;
    objectTypes: Array<string>;
    limit: number;
  }): Promise<Array<ActFact>>;

  factTypesDataLoader(): Promise<Array<FactType>>;

  factTypesToResolveByObjectId(
    objectTypeToFactTypes: { [id: string]: Array<string> },
    objects: Array<ActObject>
  ): Array<{ objectIds: Array<string>; factTypes: Array<string> }>;

  metaFactsDataLoader(props: { id: string }): Promise<Array<ActFact>>;

  multiObjectTraverseDataLoader(
    args: { objectIds: Array<string>; query: string },
    abortController?: AbortController
  ): Promise<SearchResult>;

  objectDataLoader(objectTypeName: string, objectValue: string): Promise<any>;

  objectFactsDataLoader(search: ObjectFactsSearch, abortController?: AbortController): Promise<SearchResult>;

  objectKeywordSearch(args: { keywords: string; objectTypes: Array<string>; limit: number }): Promise<Array<ActObject>>;

  objectTraverseDataLoader(search: ObjectTraverseSearch, abortController?: AbortController): Promise<SearchResult>;

  objectTypesDataLoader(): Promise<{ objectTypes: any }>;

  postJson(url: string, jsonRequest: any): Promise<any>;

  retractFact(fact: ActFact, comment: string, accessMode: string): Promise<any>;
}
