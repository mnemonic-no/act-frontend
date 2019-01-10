import React from 'react';
import PropTypes from 'prop-types';
import { wrapDisplayName, shallowEqual } from 'recompose';
import { pick, assertUniqueKeys, makeCancelable } from './utils';

const assertDataLoaderResultIsPromise = result => {
  if (!result || typeof result.then !== 'function') {
    throw new Error(
      `withDataLoader: dataLoader must always return a Promise, got ${result}`
    );
  }
};

/**
 * withDataLoader is a HOC that fetches required data for a component using a supplied dataLoader
 *
 * @param dataLoader A function returning a Promise either resolving with an object which will be merged with the props passed down, or rejecting with an error
 * @param options A set of options on how the dataLoader should behave.
 */
const withDataLoader = (dataLoader, options = {}) => Component => {
  class WithDataLoader extends React.Component {
    constructor () {
      super();

      this.state = {
        data: null,
        error: null,
        isLoading: true
      };
      this.shouldLoadData = this.shouldLoadData.bind(this);
      this.loadData = this.loadData.bind(this);
      this.onCancel = this.onCancel.bind(this);
      this.onClear = this.onClear.bind(this);
      this.forceFetch = this.forceFetch.bind(this);
      this.stopLoadingData = this.stopLoadingData.bind(this);
    }

    componentDidMount () {
      this.loadData(this.props);
    }

    componentWillReceiveProps (nextProps) {
      if (this.shouldLoadData(nextProps)) {
        this.loadData(nextProps);
      }
    }

    componentWillUnmount () {
      this.stopLoadingData();
    }

    /**
     * shouldLoadData decides when the component receives props if the dataLoader should re-run.
     * If a supplied `shouldLoadData` function is present that function is used instead.
     * If `watchProps` is present true is only returned if any of the specified keys in props have changed.
     * Else shouldLoadData only returns true if any props have changed.
     * Uses shallowEqual to compare the props.
     * @returns {boolean} True if the dataLoader should be re-run, False if not
     */
    shouldLoadData (nextProps) {
      if (options.shouldLoadData) {
        return options.shouldLoadData(this.props, nextProps);
      } else if (options.watchProps) {
        return !shallowEqual(
          pick(this.props, options.watchProps),
          pick(nextProps, options.watchProps)
        );
      }

      // Never reload data if no props have changed
      // The data loader should fetch data based on props, and if no props have changed, the data should be the same
      // forceFetch can be called after doing mutable actions
      return !shallowEqual(this.props, nextProps);
    }

    /**
     * loadData calls the supplied dataLoader, waiting for it's promise to resolve before updating the data state
     * The promise returned from the dataLoader is made cancelable using the `makeCancelable` helper function.
     * Every time this function is called the previous promise is always canceled, thus guaranteeing the latest dataLoader call is the one updating data.
     * @param props
     */
    loadData (props) {
      this.setState(() => ({
        error: null,
        isLoading: true
      }));

      this.stopLoadingData();

      const promise = dataLoader(props);
      assertDataLoaderResultIsPromise(promise);

      this._cancelable = makeCancelable(promise);
      this._cancelable.promise.then(
        data => this.setState(() => ({ data, isLoading: false })),
        error => {
          // Disregard canceled promises
          if (error && error.isCanceled) {
            return;
          }
          this.setState(() => ({ error, isLoading: false }));
        }
      );
    }

    /**
     * forceFetch forces a new reload of the data, re-running dataLoader
     * Useful after doing mutable actions.
     *
     * If the dataLoader is named and a forceFetch function is present it first calls the parent forceFetch, then it's own.
     * If the dataLoader is not named we only call the parent forceFetch function, because then we assume this dataLoader is part of a chain.
     * Else we re-run the dataLoader function.
     */
    forceFetch () {
      const hasParentForcefetch = typeof this.props.forceFetch === 'function';
      if (hasParentForcefetch && options.name) {
        this.props.forceFetch();
        this.loadData(this.props);
      } else if (hasParentForcefetch) {
        this.props.forceFetch();
      } else {
        this.loadData(this.props);
      }
    }

    /**
     * onCancel sets the isLoading state to false and cancels any dataLoading that might be going on.
     * If a parent onCancel is provided it will also be called
     */
    onCancel () {
      const hasParentOnCancel = typeof this.props.onCancel === 'function';
      if (hasParentOnCancel) {
        this.props.onCancel();
      }
      this.stopLoadingData();
      this.setState(() => ({ isLoading: false }));
    }

    /**
     * onClear clears any previous fetched data, and also stops loading any data
     */
    onClear () {
      const hasParentOnClear = typeof this.props.onClear === 'function';
      if (hasParentOnClear) {
        this.props.onClear();
      }
      this.stopLoadingData();
      this.setState(() => ({
        data: null,
        error: null,
        isLoading: false
      }));
    }

    /**
     * stopLoadingData cancels the dataLoading promise
     * The actual Promise is not actually aborted, but when it resolved or rejected the result is disregarded
     */
    stopLoadingData () {
      if (this._cancelable) {
        this._cancelable.cancel();
      }
    }

    render () {
      const {
        LoadingComponent,
        ErrorComponent,
        alwaysShowLoadingComponent = false,
        alwaysShowErrorComponent = true,
        name
      } = options;

      const props = Object.assign(
        {},
        this.props,
        {
          forceFetch: this.forceFetch,
          onCancel: this.onCancel,
          onClear: this.onClear
        },

        // If the dataLoader is named, then the error and isLoading state is also named,
        // This is useful when you want multiple dataLoaders to fetch async, but don't want to wait for all before displaying the data
        name
          ? {
            isLoading: Object.assign({}, this.props.isLoading, {
              [name]: this.state.isLoading
            }),
            error: Object.assign({}, this.props.error, {
              [name]: this.state.error
            })
          }
          : {
            isLoading: this.props.isLoading || this.state.isLoading,
            error: this.props.error || this.state.error
          },
        this.state.data
      );

      if (
        this.state.isLoading &&
        LoadingComponent &&
        (alwaysShowLoadingComponent || !this.state.data)
      ) {
        return <LoadingComponent {...props} />;
      } else if (
        this.state.error &&
        ErrorComponent &&
        (alwaysShowErrorComponent || !this.state.data)
      ) {
        return <ErrorComponent {...props} />;
      } else {
        return <Component {...props} />;
      }
    }
  }
  WithDataLoader.propTypes = {
    isLoading: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    forceFetch: PropTypes.func,
    onCancel: PropTypes.func,
    onClear: PropTypes.func
  };
  WithDataLoader.displayName = wrapDisplayName(Component, 'withDataLoader');
  return WithDataLoader;
};

/**
 * setDefaults returns a withDataLoader HOC with defaultOptions sat.
 * @param defaultOptions
 */
export const setDefaultOptions = defaultOptions => (dataLoader, options) =>
  withDataLoader(dataLoader, Object.assign({}, defaultOptions, options));

/**
 * combineDataLoaders is a helper function for withDataLoader
 * It takes a list of dataLoaders as parameters, returning one dataLoader which executes the functions async, which resolves with a merged result
 *
 * f1 => resolve({ a: 1 })
 * f2 => resolve({ b: 2 })
 * result => resolve({ a: 1, b 2 })
 *
 * @throws Error if any keys in the result are not unique, meaning the two dataLoaders have resolved with the same keys
 * @param dataLoaders A list of dataLoaders spread out as arguments
 */
export const combineDataLoaders = (...dataLoaders) => props =>
  Promise.all(dataLoaders.map(dataLoader => dataLoader(props))).then(values => {
    assertUniqueKeys(values);
    return values.reduce((a, b) => Object.assign(a, b), {});
  });

/**
 * chainDataLoaders is a helper function for withDataLoader
 * Opposed to combineDataLoaders, it chains them together and executes them synchronously, passing results
 */
export const chainDataLoaders = (...dataLoaders) => props =>
  dataLoaders.reduce(
    (previousDataLoader, dataLoader) => previousDataLoader.then(dataLoader),
    Promise.resolve(dataLoaders.length > 0 ? props : {}) // If dataLoaders is empty make sure the end resolve is empty
  );

export default withDataLoader;
