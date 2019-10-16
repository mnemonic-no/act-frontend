import { ActFact, ActObject, ContextAction, ContextActionTemplate, PredefinedObjectQuery } from '../pages/types';
import { notUndefined, replaceAll, replaceAllInObject } from '../util/util';

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

export const idsToFacts = (factIds: Array<string>, factMap: { [factId: string]: ActFact }) => {
  return factIds.map(id => factMap[id]).filter(notUndefined);
};

export const idsToObjects = (objectIds: Array<string>, objectMap: { [objectId: string]: ActObject }) => {
  return objectIds.map(id => objectMap[id]).filter(notUndefined);
};

export const countByFactType = (facts: Array<ActFact>) => {
  return facts.reduce((acc: any, curr: any) => {
    acc[curr.type.name] = (acc[curr.type.name] || 0) + 1;
    return acc;
  }, {});
};

const byName = (a: { name: string }, b: { name: string }) => (a.name > b.name ? 1 : -1);

export const predefinedObjectQueriesFor = (
  selected: ActObject | null,
  predefinedObjectQueries: Array<PredefinedObjectQuery>
) => {
  if (!selected) return [];

  return predefinedObjectQueries
    .filter(x => x.objects.find(objectType => objectType === selected.type.name))
    .sort(byName);
};

export const contextActionsFor = (
  selected: ActObject | null,
  contextActionTemplates: Array<ContextActionTemplate>,
  postAndForgetFn: (url: string, jsonBody: any, successString: string) => void
): Array<ContextAction> => {
  if (!selected) return [];

  return contextActionTemplates
    .filter((x: any) => !x.objects || x.objects.find((objectType: string) => objectType === selected.type.name))
    .map((x: any) => toContextAction(x, selected, postAndForgetFn))
    .sort(byName);
};

export const toContextAction = (
  template: ContextActionTemplate,
  selected: ActObject,
  postAndForgetFn: (url: string, jsonBody: any, successString: string) => void
): ContextAction => {
  const replacements: { [key: string]: string } = {
    ':objectValue': selected.value,
    ':objectType': selected.type.name
  };

  switch (template.action.type) {
    case 'link':
      return {
        name: template.action.name,
        description: template.action.description,
        href: replaceAll(template.action.urlPattern || '', replacements)
      };
    case 'postAndForget':
      return {
        name: template.action.name,
        description: template.action.description,
        onClick: () => {
          if (
            template.action.confirmation === undefined ||
            (template.action.confirmation && window.confirm(template.action.confirmation))
          ) {
            const url = replaceAll(template.action.pathPattern || '', replacements);
            const jsonBody = replaceAllInObject(template.action.jsonBody, replacements);
            postAndForgetFn(url, jsonBody, 'Success: ' + template.action.name);
          }
        }
      };

    default:
      throw Error('Unhandled case ' + template.action);
  }
};
