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

    if (!factType.relevantObjectBindings) return false;

    const a = factType.relevantObjectBindings[0];

    return a.sourceObjectType && !a.destinationObjectType ||
        !a.sourceObjectType && a.destinationObjectType;
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