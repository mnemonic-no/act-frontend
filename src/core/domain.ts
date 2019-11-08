import {
  ActFact,
  ActObject,
  ContextAction,
  ContextActionTemplate,
  FactType,
  PredefinedObjectQuery
} from '../pages/types';
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

export const isOneLegged = (fact: ActFact) =>
  (fact.sourceObject && !fact.destinationObject) || (!fact.sourceObject && fact.destinationObject);

export const isOneLeggedFactType = (factType: FactType) => {
  if (!factType.relevantObjectBindings || factType.relevantObjectBindings.length === 0) return false;

  const a = factType.relevantObjectBindings[0];

  return (a.sourceObjectType && !a.destinationObjectType) || (!a.sourceObjectType && a.destinationObjectType);
};

export const isBidirectional = (factType: FactType) => {
  if (!factType.relevantObjectBindings || factType.relevantObjectBindings.length === 0) return false;

  const a = factType.relevantObjectBindings[0];

  return a.bidirectionalBinding;
};

export const factTypeString = (factType: FactType | undefined | null) => {
  if (!factType) return null;
  if (isOneLeggedFactType(factType)) return 'oneLegged';
  if (isBidirectional(factType)) return 'biDirectional';

  return 'uniDirectional';
};

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

export const factsToObjects = (data: Array<ActFact>) => {
  const uniqueObjects = new Set();
  return data
    .map((fact: ActFact) => [fact.sourceObject, fact.destinationObject])
    .reduce((acc: any, x: any) => acc.concat(x), [])
    .filter((x: any) => Boolean(x))
    .filter(({ id }: { id: string }) => {
      if (uniqueObjects.has(id)) return false;
      uniqueObjects.add(id);
      return true;
    });
};

export const factMapToObjectMap = (facts: { [id: string]: ActFact }): { [id: string]: ActObject } => {
  return (
    Object.values(facts)
      .map((fact: ActFact) => [fact.destinationObject, fact.sourceObject])
      .reduce((acc, x) => acc.concat(x), [])
      .filter(x => Boolean(x)) // Remove nils
      // @ts-ignore
      .reduce((acc: { [id: string]: ActObject }, curr: ActObject) => {
        return { ...acc, [curr.id]: curr };
      }, {})
  );
};

export const objectValueText = (object: ActObject) => {
  if (object.value.match(/^\[placeholder\[[a-z0-9]{64}\]\]$/)) {
    return `<${object.type.name}>`;
  }
  return object.value;
};

export const getObjectLabelFromFact = (
  obj: ActObject,
  objectLabelFromFactType: string | null,
  facts: Array<ActFact> | undefined
) => {
  if (!objectLabelFromFactType || !facts) {
    return '';
  }
  const found = facts.find(
    f => f.type.name === objectLabelFromFactType && f.sourceObject !== undefined && f.sourceObject.id === obj.id
  );
  return found ? found.value : '';
};

export const objectLabel = (obj: ActObject, objectLabelFromFactType: string | null, facts: Array<ActFact>) => {
  const labelFromFact = getObjectLabelFromFact(obj, objectLabelFromFactType, facts);
  return labelFromFact || objectValueText(obj);
};

export const isRelevantFactType = (factType: FactType, object: ActObject) => {
  return (
    factType.relevantObjectBindings &&
    factType.relevantObjectBindings.some(
      y =>
        (y.sourceObjectType && y.sourceObjectType.name === object.type.name) ||
        (y.destinationObjectType && y.destinationObjectType.name === object.type.name)
    )
  );
};

export const validBidirectionalFactTargetObjectTypes = (factType: FactType, object: ActObject) => {
  if (!factType.relevantObjectBindings) return [];

  return factType.relevantObjectBindings
    .filter(ft => ft.bidirectionalBinding)
    .filter(
      ({ sourceObjectType, destinationObjectType }) =>
        sourceObjectType.name === object.type.name || destinationObjectType.name === object.type.name
    )
    .map(({ sourceObjectType, destinationObjectType }) => {
      return sourceObjectType.name === object.type.name ? destinationObjectType : sourceObjectType;
    });
};

export const validUnidirectionalFactTargetObjectTypes = (factType: FactType, object: ActObject, isSource: boolean) => {
  if (!factType.relevantObjectBindings) return [];

  return factType.relevantObjectBindings
    .filter(
      ({ sourceObjectType, destinationObjectType }) =>
        (isSource && sourceObjectType && sourceObjectType.name === object.type.name) ||
        (!isSource && destinationObjectType && destinationObjectType.name === object.type.name)
    )
    .map(({ sourceObjectType, destinationObjectType }) => {
      return sourceObjectType.name === object.type.name ? destinationObjectType : sourceObjectType;
    });
};

export const oneLeggedFactsFor = (object: ActObject, facts: Array<ActFact>) => {
  return facts.filter(isOneLegged).filter(f => f.sourceObject && f.sourceObject.id === object.id);
};
