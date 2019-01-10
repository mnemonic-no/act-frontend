import { compose, withState, withHandlers } from 'recompose';

const createHoc = (storage = window.localStorage) => {
  return function withLocalStorageState (
    storageName,
    stateName,
    stateUpdaterName,
    initialValue = null
  ) {
    return compose(
      withState(stateName, stateUpdaterName, () => {
        const storedValue = JSON.parse(storage.getItem(storageName));
        return storedValue !== null ? storedValue : initialValue;
      }),
      withHandlers({
        [stateUpdaterName]: props => value => {
          storage.setItem(storageName, JSON.stringify(value));
          props[stateUpdaterName](value);
        }
      })
    );
  };
};

export { createHoc };
export default createHoc();
