import config from '../config';
import actWretch from '../util/actWretch';
import { factMapToObjectMap } from './transformers';
import { ActFact, ActObject, FactType, ObjectFactsSearch, ObjectStats } from '../pages/types';
import * as _ from 'lodash/fp';

import memoizeDataLoader from '../util/memoizeDataLoader';
import { arrayToObjectWithIds } from '../util/util';

const handleError = (error: any) => {
  if (error instanceof TypeError) {
    console.error(error);
  }

  // If not WretcherError, throw it back
  if (!error.json) {
    throw error;
  }

  const originalMessage = error.json.messages && error.json.messages[0].message;
  let title = `${error.status}`;
  let message = originalMessage;

  // Display the error in the title on small messages
  if (originalMessage.length < 16) {
    title = `${error.status}: ${originalMessage}`;
    message = ``;
  }

  const newError = new Error(message);
  // @ts-ignore
  newError.title = title;
  newError.message = message;
  throw newError;
};

const handleForbiddenQueryResults = (error: any) => {
  const originalMessage = error.json.messages && error.json.messages[0].message;

  // TODO: Better error text
  const title = `${error.status}: ${originalMessage}`;
  const message = `You either don't have access to any facts relating to the requested object, or it does not exist in the database`;

  const newError = new Error(message);
  // @ts-ignore
  newError.title = title;
  newError.message = message;

  throw newError;
};

const DEFAULT_LIMIT = 10000;

/**
 * Fetch facts from an object specifed by type and value
 */
export const objectFactsDataLoader = ({ objectType, objectValue, factTypes }: ObjectFactsSearch) => {
  const requestBody = {
    ...(factTypes && factTypes.length > 0 && { factType: factTypes }),
    limit: DEFAULT_LIMIT,
    includeRetracted: true
  };

  return actWretch
    .url(`/v1/object/${encodeURIComponent(objectType)}/${encodeURIComponent(objectValue)}/facts`)
    .json(requestBody)
    .post()
    .forbidden(handleForbiddenQueryResults)
    .json(({ data }: any) => {
      const facts: { [id: string]: ActFact } = arrayToObjectWithIds(data);
      const objects: { [id: string]: ActObject } = factMapToObjectMap(facts);

      return {
        facts,
        objects
      };
    })
    .catch(handleError);
};

/**
 * Fetch facts and objects from a traversal query from a specifed object
 */
export const objectFactsTraverseDataLoader = ({ objectType, objectValue, query }: ObjectFactsSearch) =>
  actWretch
    .url(`/v1/object/${encodeURIComponent(objectType)}/${encodeURIComponent(objectValue)}/traverse`)
    .json({
      query
    })
    .post()
    .forbidden(handleForbiddenQueryResults)
    .json(({ data }: any) => {
      const isFact = (maybeFact: any) => maybeFact.hasOwnProperty('bidirectionalBinding');

      const facts: { [id: string]: ActFact } = arrayToObjectWithIds(data.filter(isFact));

      const objectsFromJson: { [id: string]: ActObject } = arrayToObjectWithIds(data.filter(_.negate(isFact)));
      const objectsFromFacts: { [id: string]: ActObject } = factMapToObjectMap(facts);
      const objects: { [id: string]: ActObject } = { ...objectsFromFacts, ...objectsFromJson };

      return {
        facts,
        objects
      };
    })
    .catch(handleError);

export const searchCriteriadataLoader = (search: ObjectFactsSearch) => {
  const { objectType, objectValue, query } = search;

  if (objectType && objectValue && query) {
    return objectFactsTraverseDataLoader(search);
  } else if (objectType && objectValue) {
    return objectFactsDataLoader(search);
  } else {
    throw new Error('TODO');
  }
};

export const resultCount = (search: ObjectFactsSearch, statistics: Array<ObjectStats>) => {
  // There is no fact type filter
  if (!search.factTypes || search.factTypes.length === 0) {
    return statistics.reduce((acc: number, x: any) => acc + x.count, 0);
  }

  return statistics.reduce((acc: number, x: ObjectStats) => {
    if (search.factTypes && search.factTypes.find(y => y === x.type.name)) {
      return acc + x.count;
    }
    return acc;
  }, 0);
};

export const checkObjectStats = async (search: ObjectFactsSearch, maxCount: number) => {
  const { objectType, objectValue, query } = search;

  // API does not support stats when there is a query
  if (query) {
    return true;
  }

  const totalCount = await actWretch
    .url(`/v1/object/${encodeURIComponent(objectType)}/${encodeURIComponent(objectValue)}`)
    .get()
    .forbidden(handleForbiddenQueryResults)
    .json(({ data }: any) => {
      return resultCount(search, data.statistics);
    })
    .catch(handleError);

  if (totalCount > maxCount) {
    return window.confirm(
      'WARNING \nLarge result set. \n\n' +
        'This query will return ' +
        totalCount +
        ' ' +
        'items which may be too much for the browser to handle. \n\n Are you sure you want to continue?'
    );
  } else return true;
};

/**
 * Resolve preconfigured facts for objects based on list of facts (with connected objects)
 */
export const autoResolveDataLoader = ({
  facts,
  objects
}: {
  facts: { [id: string]: ActFact };
  objects: { [id: string]: ActObject };
}) => {
  const originalFacts = facts;
  const originalObjects = objects;

  const autoResolveFactsKeys = Object.keys(config.autoResolveFacts);

  const promises = Object.values(objects)
    .filter((object: any) => autoResolveFactsKeys.includes(object.type.name))
    .map((object: any) => {
      return actWretch
        .url(`/v1/object/uuid/${object.id}/facts`)
        .json({
          // @ts-ignore
          factType: config.autoResolveFacts[object.type.name],
          includeRetracted: true
        })
        .post()
        .json(({ data }: any) => data);
    });

  if (promises.length === 0) {
    return Promise.resolve({ facts, objects });
  }

  return Promise.all(promises)

    .then(data => {
      const flattenedData = _.flatten(data);

      const newFacts: { [id: string]: ActFact } = arrayToObjectWithIds(flattenedData);
      const newObjects: { [id: string]: ActObject } = factMapToObjectMap(newFacts);

      return {
        facts: { ...newFacts, ...originalFacts },
        objects: { ...newObjects, ...originalObjects }
      };
    })
    .catch(handleError);
};

export const factTypesDataLoader = memoizeDataLoader(
  (): Promise<Array<FactType>> => {
    return actWretch
      .url('/v1/factType')
      .get()
      .forbidden(handleForbiddenQueryResults)
      .json(({ data }) => data)
      .catch(handleError);
  }
);

export const objectStatsDataLoader = (id: string) => {
  return actWretch
    .url(`/v1/object/uuid/${id}`)
    .get()
    .forbidden(handleForbiddenQueryResults)
    .json(({ data }: any) => data)
    .catch(handleError);
};

export const factDataLoader = (objectId: string, factTypes: Array<String>): Promise<Array<ActFact>> => {
  const requestBody = {
    ...(factTypes && factTypes.length > 0 && { factType: factTypes }),
    limit: DEFAULT_LIMIT,
    includeRetracted: false
  };

  return actWretch
    .url(`/v1/object/uuid/${objectId}/facts`)
    .json(requestBody)
    .post()
    .forbidden(handleForbiddenQueryResults)
    .json(({ data }: any) => data)
    .catch(handleError);
};

export const createFact = (request: any) => {
  return actWretch
    .url('/v1/fact')
    .json(request)
    .post()
    .forbidden(handleForbiddenQueryResults)
    .json(({ data }: any) => data);
};

export const postJson = (url: string, jsonRequest: any) => {
  return actWretch
    .url(url)
    .json(jsonRequest)
    .post()
    .res(result => result)
    .catch(handleError);
};
