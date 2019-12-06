import { TSectionConfig } from '../configUtil';

export type NamedId = {
  id: string;
  name: string;
};

export type ObjectStats = {
  type: NamedId;
  count: number;
  lastAddedTimestamp: string;
  lastSeenTimestamp: string;
};

export type ActObject = {
  id: string;
  type: NamedId;
  value: string;
  statistics?: Array<ObjectStats>;
};

export type ActFact = {
  id: string;
  type: NamedId;
  value?: string;
  inReferenceTo?: { id: string; type: NamedId };
  organization: NamedId;
  origin: NamedId;
  addedBy?: NamedId;
  source: NamedId;
  accessMode: string;
  timestamp: string;
  lastSeenTimestamp: string;
  sourceObject?: ActObject;
  destinationObject?: ActObject;
  bidirectionalBinding: boolean;
  flags: Array<'Retracted' | string>;
  certainty: number;
  confidence: number;
  trust: number;
};

export type FactType = {
  id: string;
  name: string;
  namespace: NamedId;
  relevantObjectBindings: Array<{
    bidirectionalBinding: boolean;
    sourceObjectType: NamedId;
    destinationObjectType: NamedId;
  }>;
  validator: string;
  validatorParameter: string;
};

export type FactComment = {
  id: string;
  replyTo: string;
  comment: string;
  timestamp: any;
};

export type SearchResult = {
  facts: { [id: string]: ActFact };
  objects: { [id: string]: ActObject };
};

export type SingleFactSearch = {
  id: string;
  factTypeName: string;
};

export type ObjectFactsSearch = {
  objectType: string;
  objectValue: string;
  query?: string;
  factTypes?: Array<string>;
};

export type Search = SingleFactSearch | ObjectFactsSearch;

export type SearchItem = {
  id: string;
  search: Search;
  result: SearchResult;
};

export type StateExport = {
  version: string;
  queries: Array<Search>;
  prunedObjectIds: Array<string>;
};

export type ActSelection = {
  id: string;
  kind: 'fact' | 'object';
};

export type ObjectTypeFilter = {
  id: string;
  name: string;
  checked: boolean;
};

export type PredefinedObjectQuery = {
  name: string;
  description: string;
  query: string;
  objects: Array<string>;
};

export type ContextAction = {
  name: string;
  description: string;
  href?: string;
  onClick?: () => void;
};

export interface IObjectTypeToSections {
  [objectTypeName: string]: { sections: Array<TSectionConfig> };
}

/**
 * Loading
 */
export enum LoadingStatus {
  PENDING,
  REJECTED,
  DONE
}

type TCommonLoadable<A> = {
  id: string;
  args: A;
};

export type TPendingLoadable = {
  status: LoadingStatus.PENDING;
};

export type TRejectedLoadable = {
  status: LoadingStatus.REJECTED;
  error: string;
};

export type TDoneLoadable<R> = {
  status: LoadingStatus.DONE;
  result: R;
};

export type TLoadable<R> = TPendingLoadable | TDoneLoadable<R> | TRejectedLoadable;

export type TRequestLoadable<A, R> = TCommonLoadable<A> & TLoadable<R>;

export const isRejected = <R>(arg: TLoadable<R>): arg is TRejectedLoadable => {
  return arg && arg.status === LoadingStatus.REJECTED;
};

export const isPending = <R>(arg: TLoadable<R>): arg is TPendingLoadable => {
  return arg && arg.status === LoadingStatus.PENDING;
};

export const isDone = <R>(arg: TLoadable<R>): arg is TDoneLoadable<R> => {
  return arg && arg.status === LoadingStatus.DONE;
};

export const searchId = (search: Search) => {
  if (isObjectSearch(search)) {
    return [search.objectType, search.objectValue, search.query, search.factTypes && search.factTypes.sort()]
      .filter(x => x)
      .join(':');
  } else {
    return search.id;
  }
};

export const isObjectSearch = (search: Search): search is ObjectFactsSearch => {
  return (search as ObjectFactsSearch).objectType !== undefined;
};

export const isFactSearch = (search: Search): search is SingleFactSearch => {
  return (search as SingleFactSearch).factTypeName !== undefined;
};
