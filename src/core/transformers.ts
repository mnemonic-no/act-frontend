import {ActFact, ActObject, FactType} from "../pages/types";

export const factsToObjects = (data: any) => {
    const uniqueObjects = new Set();
    return data
        .map((fact: any) => [fact.sourceObject, fact.destinationObject])
        .reduce((acc: any, x: any) => acc.concat(x), [])
        .filter((x: any) => Boolean(x))
        .filter(({id}: { id: any }) => {
            if (uniqueObjects.has(id)) return false;
            uniqueObjects.add(id);
            return true;
        });
};

export const factMapToObjectMap = (facts: { [id: string]: ActFact }): { [id: string]: ActObject } => {
    return Object.values(facts)
        .map((fact: ActFact) => [fact.destinationObject, fact.sourceObject])
        .reduce((acc, x) => acc.concat(x), [])
        .filter(x => Boolean(x)) // Remove nils
        // @ts-ignore
        .reduce((acc: { [id: string]: ActObject }, curr: ActObject) => {
            return {...acc, [curr.id]: curr}
        }, {});
};

export const isOneLegged = (fact: ActFact) =>
    fact.sourceObject && !fact.destinationObject ||
    !fact.sourceObject && fact.destinationObject;


export const isOneLeggedFactType = (factType: FactType) => {
    if (!factType.relevantObjectBindings || factType.relevantObjectBindings.length === 0) return false;

    const a = factType.relevantObjectBindings[0];

    return a.sourceObjectType && !a.destinationObjectType ||
        !a.sourceObjectType && a.destinationObjectType;
};

export const isBidirectional = (factType: FactType) => {
    if (!factType.relevantObjectBindings || factType.relevantObjectBindings.length === 0) return false;

    const a = factType.relevantObjectBindings[0];

    return a.bidirectionalBinding;
};

export const factTypeString = (factType: FactType) => {
    if (!factType) return null;
    if (isOneLeggedFactType(factType)) return "oneLegged";
    if (isBidirectional(factType)) return "biDirectional";

    return "uniDirectional";
};

export const objectValueText = (object : ActObject) => {
    if (object.value.match(/^\[placeholder\[[a-z0-9]{64}\]\]$/)) {
        return `<${object.type.name}>`;
    }
    return object.value;
};

export const getObjectLabelFromFact = (obj: ActObject, objectLabelFromFactType: string | null, facts: Array<ActFact>) => {
    if (objectLabelFromFactType) {
        const found = facts.find(f => (f.type.name === objectLabelFromFactType && f.sourceObject != undefined && f.sourceObject.id === obj.id));
        return found ? found.value : null;
    }
    return null;
};

export const objectLabel = (obj: ActObject, objectLabelFromFactType : string | null, facts: Array<ActFact>) => {
    const labelFromFact = getObjectLabelFromFact(obj, objectLabelFromFactType, facts);
    return labelFromFact || objectValueText(obj);
};

export const isRelevantFactType = (factType : FactType, object : ActObject) => {
    return factType.relevantObjectBindings && factType.relevantObjectBindings.some(
        y =>
            y.sourceObjectType && y.sourceObjectType.name == object.type.name ||
            y.destinationObjectType && y.destinationObjectType.name == object.type.name
    );
};

// TODO test
export const validBidirectionalFactTargetObjectTypes = (factType: FactType, object: ActObject) => {

    if (!factType.relevantObjectBindings) return [];

    return factType.relevantObjectBindings
        .filter (ft => ft.bidirectionalBinding)
        .filter(({sourceObjectType, destinationObjectType}) =>
            sourceObjectType.name === object.type.name || destinationObjectType.name === object.type.name)
        .map(({sourceObjectType, destinationObjectType}) => {
            return sourceObjectType.name === object.type.name ? destinationObjectType : sourceObjectType;
    });
};

// TODO test
export const validUnidirectionalFactTargetObjectTypes = (factType: FactType, object: ActObject, isSource: boolean) => {

    if (!factType.relevantObjectBindings) return [];

    return factType.relevantObjectBindings
        .filter(({sourceObjectType, destinationObjectType}) =>
            isSource && sourceObjectType && sourceObjectType.name === object.type.name ||
            !isSource && destinationObjectType && destinationObjectType.name === object.type.name)
        .map(({sourceObjectType, destinationObjectType}) => {
            return sourceObjectType.name === object.type.name ? destinationObjectType : sourceObjectType;
        });
};

