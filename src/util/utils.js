import config from '../config.json';

export const objectTypeToColor = objectType =>
  config.objectColors[objectType] || 'inherit';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#Examples
export const setUnion = (setA, setB) => {
  const union = new Set(setA);
  for (const elem of setB) {
    union.add(elem);
  }
  return union;
};

export const setDifference = (setA, setB) => {
  const difference = new Set(setA);
  for (const elem of setB) {
    difference.delete(elem);
  }
  return difference;
};

export const setIntersection = (setA, setB) => {
  const intersection = new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      intersection.add(elem);
    }
  }
  return intersection;
};

export const truncateText = (text, maxLength = 16) => {
  if (text.length > maxLength) {
    return `${text.substring(0, maxLength)}…`;
  }
  return text;
};

// If object.value is <sha256sum> (placeholder), show <object type>
export const renderObjectValue = (object, maxLength = 16) => {
  if (object.value.match(/^\[placeholder\[[a-z0-9]{64}\]\]$/)) {
    return `<${object.type.name}>`;
  }
  return truncateText(object.value, maxLength);
};

// https://github.com/facebook/react/issues/5465#issuecomment-157888325
export const makeCancelable = promise => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      // eslint-disable-next-line no-confusing-arrow
      val => (hasCanceled_ ? reject({ isCanceled: true }) : resolve(val)),
      // eslint-disable-next-line no-confusing-arrow
      error => (hasCanceled_ ? reject({ isCanceled: true }) : reject(error))
    );
  });

  return {
    promise: wrappedPromise,
    cancel () {
      hasCanceled_ = true;
    }
  };
};

// https://github.com/acdlite/recompose/blob/master/src/packages/recompose/utils/pick.js
export const pick = (obj: { [key: string]: any }, keys: Array<string>) => {
  const result = {};
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
};

// https://github.com/acdlite/recompose/blob/master/src/packages/recompose/utils/omit.js
export const omit = (obj: { [key: string]: any }, keys: Array<string>) => {
  const rest = Object.assign({}, obj);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (rest.hasOwnProperty(key)) {
      delete rest[key];
    }
  }
  return rest;
};

/**
 * assertUniqueKeys asserts that the passed objects only contain unique keys, throws an error if they do
 * @param objects
 */
export function assertUniqueKeys (objects: Array<{ [key: string]: any }>) {
  const uniqueKeys = new Set();
  objects.forEach(o => {
    Object.keys(o).forEach(key => {
      if (uniqueKeys.has(key)) {
        throw new Error(`Duplicate key not allowed: ${key}`);
      } else {
        uniqueKeys.add(key);
      }
    });
  });
}
