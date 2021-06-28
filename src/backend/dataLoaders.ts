import * as _ from 'lodash/fp';

import { factMapToObjectMap } from '../core/domain';
import {
  ActFact,
  ActObject,
  FactComment,
  FactType,
  isObjectFactsSearch,
  ObjectFactsSearch,
  ObjectStats,
  ObjectTraverseSearch,
  SearchResult,
  TConfig
} from '../core/types';
import { arrayToObjectWithIds } from '../util/util';
import { Wretcher } from 'wretch';

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

export const objectTypesDataLoader = (wretcher: Wretcher) =>
  wretcher
    .url('/v1/objectType')
    .get()
    .forbidden(handleForbiddenSearchResults)
    .json(({ data }) => ({ objectTypes: data }))
    .catch(handleError);

/**
 * Fetch facts from an object specifed by type and value
 */
export const objectFactsDataLoader = (
  wretcher: Wretcher,
  { objectType, objectValue, factTypes }: ObjectFactsSearch,
  abortController?: AbortController
): Promise<SearchResult> => {
  const requestBody = {
    ...(factTypes && factTypes.length > 0 && { factType: factTypes }),
    limit: DEFAULT_LIMIT,
    includeRetracted: true
  };

  return wretcher
    .url(`/v1/object/${encodeURIComponent(objectType)}/${encodeURIComponent(objectValue)}/facts`)
    .signal(abortController || new AbortController())
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

const isFact = (maybeFact: any) => maybeFact.hasOwnProperty('bidirectionalBinding');

/**
 * Fetch facts and objects from a traversal query from a specifed object
 */
export const objectTraverseDataLoader = (
  wretcher: Wretcher,
  { objectType, objectValue, query }: ObjectTraverseSearch,
  abortController?: AbortController
): Promise<SearchResult> =>
  wretcher
    .url(`/v1/traverse/object/${encodeURIComponent(objectType)}/${encodeURIComponent(objectValue)}`)
    .signal(abortController || new AbortController())
    .json({
      limit: DEFAULT_LIMIT,
      query
    })
    .post()
    .forbidden(handleForbiddenSearchResults)
    .json(({ data }: any) => {
      const facts: { [id: string]: ActFact } = arrayToObjectWithIds(data.filter(isFact));
      const objects: { [id: string]: ActObject } = arrayToObjectWithIds(data.filter(_.negate(isFact)));

      return {
        facts,
        objects
      };
    })
    .catch(handleError);

/**
 * Traverse the graph based on a query, starting with multiple objects
 */
export const multiObjectTraverseDataLoader = (
  wretcher: Wretcher,
  props: {
    objectIds: Array<string>;
    query: string;
  },
  abortController?: AbortController
): Promise<SearchResult> => {
  const request = {
    query: props.query,
    objects: props.objectIds,
    limit: DEFAULT_LIMIT,
    // Always include retracted since retraction filtering is currently done clientside.
    // If that is to change, we need to rerun all queries in the working history when
    // changing the "include retracted" setting in the ui
    includeRetracted: true
  };

  return wretcher
    .url('/v1/traverse/objects')
    .signal(abortController || new AbortController())
    .json(request)
    .post()
    .forbidden(handleForbiddenSearchResults)
    .json(({ data }: any) => {
      const facts: { [id: string]: ActFact } = arrayToObjectWithIds(data.filter(isFact));
      const objects: { [id: string]: ActObject } = arrayToObjectWithIds(data.filter(_.negate(isFact)));

      return {
        facts,
        objects
      };
    })
    .catch(handleError);
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

export const checkObjectStats = async (wretcher: Wretcher, search: ObjectFactsSearch, maxCount: number) => {
  // API does not support stats when there is a query
  if (!isObjectFactsSearch(search)) {
    return true;
  }

  const { objectType, objectValue } = search;

  const totalCount = await wretcher
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
export const autoResolveDataLoader = (
  wretcher: Wretcher,
  { facts, objects }: { facts: { [id: string]: ActFact }; objects: { [id: string]: ActObject } },
  config: TConfig
) => {
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
    return wretcher
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
          .filter((o: ActObject) =>
            x.objectTypes.some((objectTypeName: string) => objectTypeName === '*' || objectTypeName === o.type.name)
          )
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

export const factTypesDataLoader = (wretcher: Wretcher): Promise<Array<FactType>> => {
  return wretcher
    .url('/v1/factType')
    .get()
    .forbidden(handleForbiddenSearchResults)
    .json(({ data }) => data)
    .catch(handleError);
};

export const objectDataLoader = (wretcher: Wretcher, objectTypeName: string, objectValue: string) => {
  return wretcher
    .url(`/v1/object/${encodeURIComponent(objectTypeName)}/${encodeURIComponent(objectValue)}`)
    .get()
    .forbidden(handleForbiddenSearchResults)
    .json(({ data }: any) => data)
    .catch(handleError);
};

export const factDataLoader = (
  wretcher: Wretcher,
  objectId: string,
  factTypes: Array<string>
): Promise<Array<ActFact>> => {
  const requestBody = {
    ...(factTypes && factTypes.length > 0 && { factType: factTypes }),
    limit: DEFAULT_LIMIT,
    includeRetracted: false
  };

  return wretcher
    .url(`/v1/object/uuid/${objectId}/facts`)
    .json(requestBody)
    .post()
    .forbidden(handleForbiddenSearchResults)
    .json(({ data }: any) => data)
    .catch(handleError);
};

export const factByIdDataLoader = (wretcher: Wretcher, { id }: { id: string }): Promise<ActFact> =>
  wretcher
    .url(`/v1/fact/uuid/${id}`)
    .get()
    .forbidden(handleForbiddenSearchResults)
    .json(({ data }) => data)
    .catch(handleError);

export const factCommentsDataLoader = (wretcher: Wretcher, { id }: { id: string }): Promise<Array<FactComment>> =>
  wretcher
    .url(`/v1/fact/uuid/${id}/comments`)
    .get()
    .forbidden(handleForbiddenSearchResults)
    .json(({ data }) => data)
    .catch(handleError);

export const metaFactsDataLoader = (wretcher: Wretcher, { id }: { id: string }): Promise<Array<ActFact>> =>
  wretcher
    .url(`/v1/fact/uuid/${id}/meta`)
    .query({ includeRetracted: true })
    .get()
    .forbidden(handleForbiddenSearchResults)
    .json(({ data }) => data)
    .catch(handleError);

export const createFact = (wretcher: Wretcher, request: any) => {
  return wretcher
    .url('/v1/fact')
    .json(request)
    .post()
    .forbidden(handleForbiddenSearchResults)
    .json(({ data }: any) => data)
    .catch(handleError);
};

export const postJson = (wretcher: Wretcher, url: string, jsonRequest: any) => {
  return wretcher
    .url(url)
    .json(jsonRequest)
    .post()
    .res(result => result)
    .catch(handleError);
};

export const objectKeywordSearch = (
  wretcher: Wretcher,
  args: {
    keywords: string;
    objectTypes: Array<string>;
    limit: number;
  }
): Promise<Array<ActObject>> => {
  const requestBody = {
    keywords: args.keywords,
    objectType: args.objectTypes,
    limit: args.limit
  };

  return wretcher
    .url('/v1/object/search')
    .json(requestBody)
    .post()
    .json(({ data }: any) => data)
    .catch(handleError);
};

export const factKeywordSearch = (
  wretcher: Wretcher,
  args: {
    keywords: string;
    factTypes: Array<string>;
    objectTypes: Array<string>;
    limit: number;
  }
): Promise<Array<ActFact>> => {
  const requestBody = {
    limit: args.limit,
    keywords: args.keywords,
    factType: args.factTypes,
    objectType: args.objectTypes
  };

  return wretcher
    .url('/v1/fact/search')
    .json(requestBody)
    .post()
    .json(({ data }: any) => data)
    .catch(handleError);
};

export const retractFact = (wretcher: Wretcher, fact: ActFact, comment: string, accessMode: any): Promise<any> => {
  return wretcher
    .url(`/v1/fact/uuid/${fact.id}/retract`)
    .json({
      comment: comment,
      accessMode: accessMode
    })
    .post()
    .json(({ data }) => data)
    .catch(handleError);
};
