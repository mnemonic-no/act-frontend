import {
  objectToCytoscapeNode,
  factToCytoscapeNode,
  factsToCytoscapeEdges,
  factToSingleCytoscapeEdge
} from './cytoscapeTransformers';

export const factsToObjects = data => {
  const uniqueObjects = new Set();
  const result = data
    .map(fact => [fact.sourceObject, fact.destinationObject])
    .reduce((acc, x) => acc.concat(x), [])
    .filter(x => Boolean(x))
    .filter(({ id }) => {
      if (uniqueObjects.has(id)) return false;
      uniqueObjects.add(id);
      return true;
    });
  return result;
};

export const objectTypesFromObjects = objects => {
  const uniqueTypes = new Set();
  return objects.map(object => object.type).filter(({ id }) => {
    if (uniqueTypes.has(id)) return false;
    uniqueTypes.add(id);
    return true;
  });
};

export const objectFactsToElements = ({ facts, objects, factsAsNodes }) => {
  let elements;
  if (factsAsNodes) {
    console.log('Render the object nodes', {
      objects: objects.map(objectToCytoscapeNode)
    });
    console.log('Render the fact nodes', {
      facts: facts.map(factToCytoscapeNode)
    });
    console.log('Render the fact edges', {
      factEdges: factsToCytoscapeEdges(facts)
    });
    elements = [
      ...objects.map(objectToCytoscapeNode),
      ...facts.map(factToCytoscapeNode),
      ...factsToCytoscapeEdges(facts)
    ];
  } else {
    const factsWithTwoConnections = facts.filter(
      fact => factsToObjects([fact]).length === 2
    );
    const factsWithOneConnection = facts.filter(
      fact => factsToObjects([fact]).length === 1
    );

    elements = [
      ...objects.map(objectToCytoscapeNode),
      ...factsWithTwoConnections.map(factToSingleCytoscapeEdge),

      // Facts with not two connections 1 or more than 2
      ...factsWithOneConnection.map(factToCytoscapeNode),
      ...factsToCytoscapeEdges(factsWithOneConnection)
    ];
  }

  return elements;
};
