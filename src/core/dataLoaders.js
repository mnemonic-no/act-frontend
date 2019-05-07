import config from '../config';
import actWretch from '../util/actWretch';
import { factsToObjects } from './transformers';

const handleError = error => {
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
  newError.title = title;
  newError.message = message;
  throw newError;
};

const handleForbiddenQueryResults = error => {
  const originalMessage = error.json.messages && error.json.messages[0].message;

  // TODO: Better error text
  const title = `${error.status}: ${originalMessage}`;
  const message = `You either don't have access to any facts relating to the requested object, or it does not exist in the database`;

  const newError = new Error(message);
  newError.title = title;
  newError.message = message;

  throw newError;
};

const DEFAULT_LIMIT = 10000;

/**
 * Fetch facts from an object specifed by type and value
 */
export const objectFactsDataLoader = ({ objectType, objectValue }) =>
  actWretch
    .url(
      `/v1/object/${encodeURIComponent(objectType)}/${encodeURIComponent(
        objectValue
      )}/facts`
    )
    .json({
      limit: DEFAULT_LIMIT,
      includeRetracted: true
    })
    .post()
    .forbidden(handleForbiddenQueryResults)
    .json(({ data }) => {
      const factsData = data;
      const objectsData = factsToObjects(data);
      return {
        data: {
          factsData,
          objectsData,
          factsSet: new Set(factsData.map(fact => fact.id)),
          objectsSet: new Set(objectsData.map(fact => fact.id))
        }
      };
    })
    .catch(handleError);

/**
 * Fetch facts and objects from a traversal query from a specifed object
 */
export const objectFactsTraverseDataLoader = ({
  objectType,
  objectValue,
  query
}) =>
  actWretch
    .url(
      `/v1/object/${encodeURIComponent(objectType)}/${encodeURIComponent(
        objectValue
      )}/traverse`
    )
    .json({
      query
    })
    .post()
    .forbidden(handleForbiddenQueryResults)
    .json(({ data }) => {
      const isFact = maybeFact =>
        maybeFact.hasOwnProperty('bidirectionalBinding');

      const factsSet = new Set();
      const objectsSet = new Set();
      const factsData = [];
      const objectsData = [];

      data.forEach(x => {
        if (isFact(x) && !factsSet.has(x.id)) {
          factsSet.add(x.id);
          factsData.push(x);
        } else if (!isFact(x) && !objectsSet.has(x.id)) {
          objectsSet.add(x.id);
          objectsData.push(x);
        }
      });

      // Add objects from facts
      factsToObjects(factsData).forEach(x => {
        if (objectsSet.has(x.id)) return false;
        objectsSet.add(x.id);
        objectsData.push(x);
      });

      return {
        data: {
          factsData,
          objectsData,
          factsSet,
          objectsSet
        }
      };
    })
    .catch(handleError);

export const searchCriteriadataLoader = ({
  searchCriteria: { objectType, objectValue, query }
}) => {
  if (objectType && objectValue && query) {
    return objectFactsTraverseDataLoader({ objectType, objectValue, query });
  } else if (objectType && objectValue) {
    return objectFactsDataLoader({ objectType, objectValue });
  } else {
    throw new Error('TODO');
  }
};

/**
 * Resolve preconfigured facts for objects based on list of facts (with connected objects)
 */
export const autoResolveDataLoader = ({ data }) => {
  const { factsData, objectsData = [], factsSet, objectsSet } = data;

  const autoResolveFactsKeys = Object.keys(config.autoResolveFacts);
  const promises = objectsData
    .filter(object => autoResolveFactsKeys.includes(object.type.name))
    .map(object =>
      actWretch
        .url(`/v1/object/uuid/${object.id}/facts`)
        .json({
          factType: config.autoResolveFacts[object.type.name],
          includeRetracted: true
        })
        .post()
        .json(({ data }) => data)
    );

  if (promises.length === 0) {
    return Promise.resolve({ data });
  }
  return (
    Promise.all(promises)
      .then(data => data.reduce((acc, x) => acc.concat(x), [])) // flatten
      .then(data => ({
        resolvedFacts: data,
        resolvedObjects: factsToObjects(data)
      }))
      // Merge
      .then(({ resolvedFacts, resolvedObjects }) => {
        const newFactsSet = new Set(factsSet);
        const newObjectsSet = new Set(objectsSet);

        // Distinct and poplate sets
        const mergedFacts = factsData.concat(
          resolvedFacts.filter(fact => {
            if (newFactsSet.has(fact.id)) return false;
            newFactsSet.add(fact.id);
            return true;
          })
        );
        const mergedObjects = objectsData.concat(
          resolvedObjects.filter(object => {
            if (newObjectsSet.has(object.id)) return false;
            newObjectsSet.add(object.id);
            return true;
          })
        );

        return {
          factsData: mergedFacts,
          objectsData: mergedObjects,
          objectsSet: newObjectsSet,
          factsSet: newFactsSet
        };
      })
      .then(data => ({ data }))
      .catch(handleError)
  );
};

// Resolve facts between a list of objects
// TODO: Should fetch retractions for facts, as they might not be part of the result by default
export const resolveFactsDataLoader = ({ objectTypes, objectValues }) =>
  actWretch
    .url(`/v1/object/traverse`)
    .json({
      objectType: objectTypes.map(x => x.name),
      objectValue: objectValues.map(x => x.value),
      query: `g.outE().dedup()`
    })
    .post()
    .json(({ data }) => data)
    .then(data => {
      const ids = new Set(objectValues.map(x => x.id));
      return data.filter(x => x.objects.every(y => ids.has(y.object.id)));
    });
