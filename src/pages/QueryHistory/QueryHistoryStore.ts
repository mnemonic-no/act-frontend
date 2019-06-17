import {action, computed} from "mobx";
import MainPageStore from "../MainPageStore";

// @ts-ignore
import {saveAs} from 'file-saver';
import {isObjectSearch, Query, searchId} from "../types";

export type QueryItem = {
    id: string,
    title: string,
    isSelected: boolean,
    details: Array<string>,
    onClick: () => void,
    onRemoveClick: () => void
}

const queryItem = (q: Query, store: QueryHistoryStore): QueryItem => {

    const search = q.search;
    const id = searchId(search);

    const common = {
        id: id,
        isSelected: id === store.selectedQueryId,
        onClick: () => store.setSelectedQuery(q),
        onRemoveClick: () => store.removeQuery(q)
    };

    if (isObjectSearch(search)) {
        const details = [];
        if (search.factTypes) { details.push("Fact types: " + search.factTypes); }
        if (search.query) { details.push(search.query) }

        return {
            ...common,
            title: search.objectType + ": " + search.objectValue,
            details: details
        }
    } else {
        return {
            ...common,
            title: "Fact: " + search.factTypeName,
            details: ["Id: " + id]
        }
    }
};


class QueryHistoryStore {
    root: MainPageStore;

    constructor(root: MainPageStore) {
        this.root = root;
    }

    @computed get mergePrevious(): boolean {
        return this.root.queryHistory.mergePrevious;
    }

    @computed get queries(): Array<Query> {
        return this.root.queryHistory.queries.filter((q) => {
            return q.result !== null
        });
    }

    @computed get queryItems(): Array<QueryItem> {
        return this.root.queryHistory.queries
            .filter(q => q.result !== null)
            .map(q => queryItem(q, this))
    };

    @computed get selectedQueryId(): string {
        return this.root.queryHistory.selectedQueryId;
    }

    @action
    setSelectedQuery(query : Query) {
        this.root.queryHistory.selectedQueryId = query.id;
    }

    @action
    removeQuery(query : Query) {
        this.root.queryHistory.removeQuery(query);
    }

    @action
    flipMergePrevious() {
        this.root.queryHistory.mergePrevious = !this.root.queryHistory.mergePrevious;
    }

    @action.bound
    export() {
        const searches = this.root.queryHistory.queries.map((q : any) => ({...q.search}));

        const blob = new window.Blob(
            [JSON.stringify(searches, null, 2)],
            { type: 'application/json' }
        );
        saveAs(blob, 'act-search-history.json');
    }

    @action.bound
    clear() {
        this.root.queryHistory.removeAllQueries();
    }
}


export default QueryHistoryStore;