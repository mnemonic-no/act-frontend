import { ActFact, ActObject } from '../pages/types';
import { notUndefined } from '../util/util';

export function isRetracted(fact: ActFact) {
  return fact.flags.some(x => x === 'Retracted');
}

export function isRetraction(fact: ActFact) {
  return fact.type.name === 'Retraction';
}

export function isMetaFact(fact: ActFact) {
  return !fact.destinationObject && !fact.sourceObject && fact.inReferenceTo;
}

/**
 * Makes a mapping between object ids and the facts in which the object is referenced
 * @param facts
 */
export function objectIdToFacts(facts: Array<ActFact>): { [objectId: string]: Array<ActFact> } {
  return facts.reduce((acc: { [objectId: string]: Array<ActFact> }, fact: ActFact) => {
    const objects: Array<ActObject> = [fact.sourceObject, fact.destinationObject].filter(notUndefined);

    for (const o of objects) {
      if (!acc[o.id]) {
        acc[o.id] = [fact];
      } else {
        acc[o.id] = [...acc[o.id], fact];
      }
    }
    return acc;
  }, {});
}
