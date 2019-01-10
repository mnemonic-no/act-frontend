/**
 * memoizeDataLoader is a Higher Order Function that memorises a promise result for a dataLoader, returning that result next time given the same props..
 * It will only cache the result if the promise resolves
 *
 * @param func The dataLoader function
 * @param watchProps Which props to watch for
 * @returns {function(...[*]=)}
 */

const memoizeDataLoader = (func, watchProps = []) => {
  const cache = {};
  return (props = {}) => {
    const stringArgs = JSON.stringify(watchProps.map(key => props[key]));
    if (cache.hasOwnProperty(stringArgs)) {
      return Promise.resolve(cache[stringArgs]);
    }

    cache[stringArgs] = func(props).then(
      result => {
        cache[stringArgs] = result;
        return result;
      },
      error => {
        delete cache[stringArgs];
        throw error;
      }
    );

    return cache[stringArgs];
  };
};

export default memoizeDataLoader;
