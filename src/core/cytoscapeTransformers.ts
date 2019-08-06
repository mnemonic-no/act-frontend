import { truncateText } from '../util/utils';
import { isOneLegged, objectLabel } from './transformers';
import { ActFact, ActObject } from '../pages/types';
import { isRetracted } from './domain';

/*
 * Convert ACT object and fact structures to cytoscape structures
 */
export const objectToCytoscapeNode = (object: ActObject, label: string) => {
  return {
    group: 'nodes',
    data: {
      id: object.id,
      label: truncateText(label, 16),
      type: object.type.name,
      value: object.value,
      isFact: false
    },
    classes: object.type.name
  };
};

// Treat facts as edges, assumes facts has EXACTLY two connected objects
export const factToSingleCytoscapeEdge = (fact: ActFact) => {
  const source = fact.sourceObject && fact.sourceObject.id;
  const target = fact.destinationObject && fact.destinationObject.id;
  const isBiDirectional = fact.bidirectionalBinding;

  const classes = isBiDirectional ? 'bidirectional' : '';

  return {
    group: 'edges',
    data: {
      id: `edge-${fact.id}`,
      isBiDirectional,
      source,
      target,
      label:
        fact.value && fact.value.startsWith('-')
          ? fact.type.name
          : `${fact.type.name}: ${truncateText(fact.value, 20)}`,

      isFact: true,
      factId: fact.id,
      retracted: isRetracted(fact)
    },
    classes
  };
};

export const objectFactsToElements = ({
  facts,
  objects,
  objectLabelFromFactType
}: {
  facts: Array<ActFact>;
  objects: Array<ActObject>;
  objectLabelFromFactType: string | null;
}) => {
  const twoLeggedFacts = facts.filter(f => !isOneLegged(f));

  return [
    ...objects.map(o => objectToCytoscapeNode(o, objectLabel(o, objectLabelFromFactType, facts))),
    ...twoLeggedFacts.map(factToSingleCytoscapeEdge)
  ];
};
