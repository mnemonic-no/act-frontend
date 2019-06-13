import {action, computed, observable, reaction} from "mobx";
import MainPageStore from "./MainPageStore";
import {Query, QueryResult} from "./types";

class QueryHistory {
    root: MainPageStore;

    @observable.shallow queries: Array<Query> = [];

    @observable mergePrevious: boolean = true;
    @observable selectedQueryId: string = "";

    constructor(root: MainPageStore) {
        this.root = root;

        // Make the URL reflect the initial query
        reaction(() => this.result,
            (q) => {
                if (this.queries.length === 0) {
                    history.pushState(null, "", "/");
                } else if (location.pathname === "/")  {
                    history.pushState(null, "", this.root.ui.searchStore.asPathname());
                }
            })
    }

    @computed get isEmpty(): boolean {
        return this.queries.length === 0;
    }

    @computed get result(): QueryResult {

        if (!this.mergePrevious) {
            const selectedQuery = this.queries.find( (query : Query) => query.id === this.selectedQueryId);
            return selectedQuery ? selectedQuery.result : {facts: {}, objects: {}};
        }

        const uptoSelectedQuery = [];
        for (let q of this.queries) {

            if (q.id !== this.selectedQueryId) {
                uptoSelectedQuery.push(q)
            } else {
                uptoSelectedQuery.push(q);
                break;
            }
        }

        return uptoSelectedQuery
            .map((query) => query.result)
            .reduce((acc: QueryResult, x: QueryResult) => {
                    return {
                        facts: {...acc.facts, ...x.facts},
                        objects: {...acc.objects, ...x.objects}
                    }
                },
                {facts: {}, objects: {}});
    }

    @action
    addQuery(query: Query) {
        const selectedIndex = this.queries.findIndex( (q : Query) => q.id === this.selectedQueryId);
        this.queries.splice(selectedIndex + 1, 0, query);
        this.selectedQueryId = query.id;
        this.root.ui.cytoscapeStore.setSelectedNodeBasedOnSearch(query.search);
    }

    @action
    removeQuery(query: Query) {
        // @ts-ignore
        this.queries.remove(query);
    }

    @action
    removeAllQueries() {
        // @ts-ignore
        this.queries.clear();
    }
}

export default QueryHistory;