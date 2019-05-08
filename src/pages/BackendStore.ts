import MainPageStore from "./MainPageStore";
import {action, observable} from "mobx";
import {autoResolveDataLoader, searchCriteriadataLoader} from "../core/dataLoaders";
import {Query, Search} from "./QueryHistory";


class BackendStore {

    root: MainPageStore;

    @observable isLoading: boolean = false;
    @observable error: Error | null = null;

    constructor(root: MainPageStore) {
        this.root = root;
    }

    arrayToObjectWithIds(inputArray: Array<any>) {
        return inputArray.reduce((acc, curr) => ({
                ...acc,
                [curr.id]: curr
            }),
            {})
    }

    @action
    executeQuery(search: Search) {

        const id = JSON.stringify(search);

        // Skip for existing queries
        if (this.root.queryHistory.queries.some((q) => q.id === id)) {
            return;
        }

        this.isLoading = true;

        searchCriteriadataLoader({
            searchCriteria: {
                objectType: search.objectType,
                objectValue: search.objectValue,
                query: (search.query ? search.query : ""),
                factTypes: search.factTypes
            }
        })
            .then(autoResolveDataLoader)
            .then(
                action((result: any) => {
                    const q: Query = {
                        id: id,
                        search: search,
                        result: {
                            facts: this.arrayToObjectWithIds(result.data.factsData),
                            objects: this.arrayToObjectWithIds(result.data.objectsData)
                        }
                    };
                    this.root.queryHistory.addQuery(q);
                }),
                action((err: any) => {
                    this.error = err;
                }))
            .finally(() => this.isLoading = false);
    }
}

export default BackendStore;