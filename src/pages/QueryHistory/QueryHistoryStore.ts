import {action, computed} from "mobx";
import MainPageStore from "../MainPageStore";

// @ts-ignore
import { saveAs } from 'file-saver';
import {Query} from "../types";

class QueryHistoryStore {
    root: MainPageStore;

    constructor(root: MainPageStore) {
        this.root = root;
    }

    @computed get mergePrevious() : boolean {
        return this.root.queryHistory.mergePrevious;
    }

    @computed get queries() : Array<Query> {
        return this.root.queryHistory.queries.filter ( (q) => {
            return q.result !== null
        });
    }

    @computed get selectedQueryId() : string {
        return this.root.queryHistory.selectedQueryId;
    }

    @action
    setSelectedQuery (query: Query ) {
        this.root.queryHistory.selectedQueryId = query.id;
    }

    @action
    removeQuery (query: Query) {
        this.root.queryHistory.removeQuery(query);
    }

    @action
    flipMergePrevious() {
        this.root.queryHistory.mergePrevious = !this.root.queryHistory.mergePrevious;
    }

    export() {
        const searches = this.root.queryHistory.queries.map((q : any) => ({...q.search}));

        const blob = new window.Blob(
            [JSON.stringify(searches, null, 2)],
            { type: 'application/json' }
        );
        saveAs(blob, 'act-search-history.json');
    }
}


export default QueryHistoryStore;