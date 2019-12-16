import { ActFact, ActObject, FactType, LoadingStatus } from './types';
import { SimpleSearch } from '../backend/SimpleSearchBackendStore';

export const objectTypes = {
  incident: { id: 'incidentId', name: 'incident' },
  ipv4: { id: 'ipv4id', name: 'ipv4' },
  report: { id: 'reportId', name: 'report' },
  threatActor: { id: 'threatActorId', name: 'threatActor' },
  uri: { id: 'uriId', name: 'uri' }
};

export const factTypes = {
  alias: { id: 'aliasId', name: 'alias' },
  mentions: { id: 'mentionsId', name: 'mentions' },
  retraction: { id: 'retractionId', name: 'Retraction' }
};

export const actObject = (args: { [key: string]: any }): ActObject => {
  return { ...{ id: 'changeme', type: { id: 'x', name: 'something' }, value: '123' }, ...args };
};

export const fact = (args: { [key: string]: any }): ActFact => {
  const defaults: ActFact = {
    id: 'a',
    sourceObject: actObject({ id: 'a' }),
    destinationObject: actObject({ id: 'b' }),
    type: { id: 'a', name: 'alias' },
    organization: { id: 'o', name: 'dontknow' },
    source: { id: 'x', name: 'dontcare' },
    origin: { id: 'z', name: 'the origin' },
    timestamp: '2019-05-14T12:12:30.000Z',
    lastSeenTimestamp: '2019-06-14T10:12:37.183Z',
    bidirectionalBinding: false,
    accessMode: '',
    value: 'changeme',
    flags: [],
    trust: 1,
    confidence: 0.8,
    certainty: 0.8
  };

  return {
    ...defaults,
    ...args
  };
};

export const factType = (args: { [key: string]: any }): FactType => {
  const defaults: FactType = {
    id: 'x',
    name: 'default name',
    relevantObjectBindings: [],
    namespace: { id: '123', name: 'global' },
    validator: 'RegexValidator',
    validatorParameter: '(.|\n)*'
  };

  return {
    ...defaults,
    ...args
  };
};

export const simpleSearch = (args: { [key: string]: any }): SimpleSearch => {
  const defaults: SimpleSearch = {
    id: 'x',
    args: { searchString: '', objectTypeFilter: [] },
    status: LoadingStatus.DONE,
    result: { objects: [], facts: [] }
  };

  return {
    ...defaults,
    ...args
  };
};
