import config from '../config';

export const objectTypeToColor = objectType => config.objectColors[objectType] || 'inherit';

export const factColor = '#F84';

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
    cancel() {
      hasCanceled_ = true;
    }
  };
};

// https://github.com/acdlite/recompose/blob/master/src/packages/recompose/utils/pick.js
export const pick = (obj, keys) => {
  const result = {};
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
};

/**
 * assertUniqueKeys asserts that the passed objects only contain unique keys, throws an error if they do
 * @param objects
 */
export function assertUniqueKeys(objects) {
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
