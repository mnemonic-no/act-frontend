import {observable} from 'mobx';

import dataState, {Data} from './data';

import {resolveFactsDataLoader} from '../core/dataLoaders';

class DataFetchingState {

    @observable isLoading: boolean = false;
    @observable error: any = null;

    resolveCurrentFacts() {
        this.isLoading = true;
        resolveFactsDataLoader({
            objectTypes: dataState.current.objectTypes,
            objectValues: dataState.current.data.objectsData
        }).then((data: any) => {
            this.isLoading = false;
            dataState.addNode({
                data: new Data({factsData: data}),
                search: {resolvedFacts: true}
            });
        }).catch((error: any) => {
            this.isLoading = false;
            this.error = error;
        });
    }
}

export default new DataFetchingState();
