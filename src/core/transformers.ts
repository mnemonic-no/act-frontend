import {ActFact, ActObject} from "../pages/types";

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

export const isOneLegged = (fact: ActFact) => fact.sourceObject && !fact.destinationObject;