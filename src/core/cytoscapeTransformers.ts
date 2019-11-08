import { truncateText } from '../util/util';
import { isOneLegged, isRetracted, objectLabel } from './domain';
import { ActFact, ActObject } from '../pages/types';

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

export const oneLeggedFactToCytoscapeEdge = (fact: ActFact) => {
  const source = fact.sourceObject && fact.sourceObject.id;
  const target = fact.destinationObject && fact.destinationObject.id;

  return {
    group: 'edges',
    data: {
      id: `edge-${fact.id}`,
      isBiDirectional: false,
      source: source || target,
      target: target || source,
      label:
        fact.value && fact.value.startsWith('-')
          ? fact.type.name
          : `${fact.type.name}: ${truncateText(fact.value || '', 20)}`,
      isFact: true,
      factId: fact.id,
      oneLegged: true
    }
  };
};

export const twoLeggedFactToCytoscapeEdge = (fact: ActFact) => {
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
          : `${fact.type.name}: ${truncateText(fact.value || '', 20)}`,

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
  // Put one legged facts in the graph in order to keep the currently selected elements in sync with the selectionStore
  return [
    ...facts.map(f => (isOneLegged(f) ? oneLeggedFactToCytoscapeEdge(f) : twoLeggedFactToCytoscapeEdge(f))),
    ...objects.map(o => objectToCytoscapeNode(o, objectLabel(o, objectLabelFromFactType, facts)))
  ];
};
