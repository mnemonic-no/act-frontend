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

const handleForbiddenSearchResults = (error: any) => {
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
    .forbidden(handleForbiddenSearchResults)
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
    .forbidden(handleForbiddenSearchResults)
    .json(({ data }: any) => {
      const isFact = (maybeFact: any) => maybeFact.hasOwnProperty('bidirectionalBinding');

      const facts: { [id: string]: ActFact } = arrayToObjectWithIds(data.filter(isFact));
      const objects: { [id: string]: ActObject } = arrayToObjectWithIds(data.filter(_.negate(isFact)));

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

export const resultCount = (search: ObjectFactsSearch, statistics: Array<ObjectStats> | undefined) => {
  if (!statistics) {
    return 0;
  }

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
    .forbidden(handleForbiddenSearchResults)
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
  const objectsFromFacts: { [id: string]: ActObject } = factMapToObjectMap(facts);
  const allObjects = [...Object.values(objects), ...Object.values(objectsFromFacts)];

  const factTypesToSearchFor: Array<{
    objectIds: Array<string>;
    factTypes: Array<string>;
  }> = factTypesToResolveByObjectId(config.autoResolveFacts, allObjects);

  if (!factTypesToSearchFor || factTypesToSearchFor.length === 0) {
    return Promise.resolve({ facts, objects });
  }

  const promises = factTypesToSearchFor.map(({ objectIds, factTypes }) => {
    return actWretch
      .url('/v1/fact/search')
      .json({ factType: factTypes, includeRetracted: true, objectID: objectIds, limit: DEFAULT_LIMIT })
      .post()
      .json(({ data }: any) => data);
  });

  return Promise.all(promises)
    .then(data => {
      const flattenedData = _.flatten(data);

      const newFacts: { [id: string]: ActFact } = arrayToObjectWithIds(flattenedData);

      return {
        facts: { ...newFacts, ...facts },
        objects
      };
    })
    .catch(handleError);
};

export const factTypesToResolveByObjectId = (
  objectTypeToFactTypes: { [id: string]: Array<string> },
  objects: Array<ActObject>
): Array<{ objectIds: Array<string>; factTypes: Array<string> }> => {
  const factTypesToObjectTypes = matchFactTypesToObjectTypes(objectTypeToFactTypes);

  return _.pipe(
    _.map((x: { factTypes: Array<string>; objectTypes: Array<string> }) => {
      return {
        ...x,
        objectIds: objects
          .filter((o: ActObject) => x.objectTypes.some((objectTypeName: string) => objectTypeName === o.type.name))
          .map((o: ActObject) => o.id)
      };
    }),
    _.filter(x => x.objectIds.length > 0)
  )(factTypesToObjectTypes);
};

export const matchFactTypesToObjectTypes = (factTypeToObjectTypes: { [id: string]: Array<string> }) => {
  return _.pipe(
    _.toPairs,
    _.map(([objectType, factTypes]: [string, Array<string>]) => ({ factTypes: factTypes, objectTypes: [objectType] })),
    _.groupBy('factTypes'),
    _.values,
    _.map((x: Array<{ factTypes: Array<string>; objectTypes: Array<string> }>) => {
      const factTypes = x[0].factTypes;
      const objectTypes = _.flatMap((a: { objectTypes: Array<string> }) => a.objectTypes)(x);
      return { factTypes: factTypes, objectTypes: objectTypes };
    })
  )(factTypeToObjectTypes);
};

export const factTypesDataLoader = memoizeDataLoader(
  (): Promise<Array<FactType>> => {
    return actWretch
      .url('/v1/factType')
      .get()
      .forbidden(handleForbiddenSearchResults)
      .json(({ data }) => data)
      .catch(handleError);
  }
);

export const objectStatsDataLoader = (id: string) => {
  return actWretch
    .url(`/v1/object/uuid/${id}`)
    .get()
    .forbidden(handleForbiddenSearchResults)
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
    .forbidden(handleForbiddenSearchResults)
    .json(({ data }: any) => data)
    .catch(handleError);
};

export const createFact = (request: any) => {
  return actWretch
    .url('/v1/fact')
    .json(request)
    .post()
    .forbidden(handleForbiddenSearchResults)
    .json(({ data }: any) => data)
    .catch(handleError);
};

export const postJson = (url: string, jsonRequest: any) => {
  return actWretch
    .url(url)
    .json(jsonRequest)
    .post()
    .res(result => result)
    .catch(handleError);
};

export const objectKeywordSearch = (keywords: string): Promise<Array<ActObject>> => {
  const requestBody = {
    keywords: keywords,
    limit: 300
  };

  return actWretch
    .url('/v1/object/search')
    .json(requestBody)
    .post()
    .json(({ data }: any) => data)
    .catch(handleError);
};

export const factKeywordSearch = (keywords: string): Promise<Array<ActObject>> => {
  const requestBody = {
    limit: 300,
    keywords: keywords,
    factType: ['name']
  };

  return actWretch
    .url('/v1/fact/search')
    .json(requestBody)
    .post()
    .json(({ data }: any) => data)
    .catch(handleError);
};
