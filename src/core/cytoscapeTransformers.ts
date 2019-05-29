import {truncateText} from '../util/utils';
import {isOneLegged, objectLabel} from "./transformers";
import {ActFact, ActObject} from "../pages/types";

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
    }
};

export const factToCytoscapeNode = (fact: ActFact) => ({
    group: 'nodes',
    data: {
        id: `node-${fact.id}`,
        label: fact.value && fact.value.startsWith('-')
            ? fact.type.name
            : truncateText(fact.value, 30),
        isFact: true,
        factId: fact.id,
        retracted: Boolean(fact.retracted)
    },
    classes: 'fact'
});

// Treats facts as node, opposed to edge
export const factToCytoscapeEdges = (fact: ActFact) => {
    // @ts-ignore
    let edges = [];
    if (fact.sourceObject) {
        const source = fact.sourceObject.id;
        const target = `node-${fact.id}`;
        const id = fact.id + fact.sourceObject.id;
        // @ts-ignore
        edges = edges.concat({source, target, id});
    }
    if (fact.destinationObject) {
        const target = fact.destinationObject.id;
        const source = `node-${fact.id}`;
        const id = fact.id + fact.destinationObject.id;
        edges = edges.concat({source, target, id});
    }
    if (!fact.sourceObject && !fact.destinationObject) {
        console.log(`invalid source and target for fact ${fact.id}`);
        return {};
    }

    const isBiDirectional = fact.bidirectionalBinding;
    const classes = isBiDirectional ? 'bidirectional' : '';
    return edges.map(({id, source, target}) => ({
        group: 'edges',
        data: {
            id,
            source,
            target,

            isFact: true,
            factId: fact.id,
            retracted: Boolean(fact.retracted)
        },
        classes
    }));
};
export const factsToCytoscapeEdges = (facts : Array<ActFact>) =>
    facts.map(factToCytoscapeEdges)
         .reduce((acc: any, x: any) => acc.concat(x), []);

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
            label: fact.value && fact.value.startsWith('-')
                ? fact.type.name
                : `${fact.type.name}: ${truncateText(fact.value, 20)}`,

            isFact: true,
            factId: fact.id,
            retracted: Boolean(fact.retracted)
        },
        classes
    };
};

export const objectFactsToElements = ({facts, objects, factsAsNodes, objectLabelFromFactType}: {
    facts: Array<ActFact>,
    objects: Array<ActObject>,
    factsAsNodes: boolean
    objectLabelFromFactType: string | null
}) => {
    const twoLeggedFacts = facts.filter(f => !isOneLegged(f));

    if (factsAsNodes) {
        return [
            ...objects.map((o) => objectToCytoscapeNode(o, objectLabel(o, objectLabelFromFactType, facts))),
            ...twoLeggedFacts.map(factToCytoscapeNode),
            ...factsToCytoscapeEdges(twoLeggedFacts)
        ];
    } else {
        return [
            ...objects.map((o) => objectToCytoscapeNode(o, objectLabel(o, objectLabelFromFactType, facts))),
            ...twoLeggedFacts.map(factToSingleCytoscapeEdge)
        ];
    }
};
