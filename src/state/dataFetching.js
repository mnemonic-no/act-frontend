import { observable, extendObservable } from 'mobx';

import dataState, { Data } from './data';

import { resolveFactsDataLoader } from '../core/dataLoaders';

class DataFetchingState {
  constructor () {
    extendObservable(
      this,
      {
        isLoading: false,
        error: null
      },
      {
        error: observable.ref
      }
    );
  }

  resolveCurrentFacts () {
    this.isLoading = true;
    resolveFactsDataLoader({
      objectTypes: dataState.current.objectTypes,
      objectValues: dataState.current.data.objectsData
    })
      .then(data => {
        this.isLoading = false;
        dataState.addNode({
          data: new Data({ factsData: data }),
          search: { resolvedFacts: true }
        });
      })
      .catch(error => {
        this.isLoading = false;
        this.error = error;
      });
  }
}

export default new DataFetchingState();
