import MainPageStore from "../MainPageStore";
import {action, observable} from "mobx";
import {Search} from "../QueryHistory";


class SearchStore {

    root: MainPageStore;
    @observable objectType: string = "";
    @observable objectValue: string = "";
    @observable query: string = "";


    constructor(root: MainPageStore) {
        this.root = root;
    }

    @action
    submitSearch() {
        const {objectType, objectValue, query}  = this;
        this.root.backendStore.executeQuery({objectType, objectValue, query});
    }

    @action
    clearGraph() {
        this.root.queryHistory.removeAllQueries();
    }

    executeSearch(search: Search) {
        this.objectValue = search.objectValue;
        this.objectType = search.objectType;
        if (search.query) {this.query = search.query}

        this.submitSearch();
    }

    asPathname() : string {
        if (this.query && this.query.length > 0) {
            return "/graph-query/" + encodeURIComponent(this.objectType) + "/" + encodeURIComponent(this.objectValue)+ "/" + encodeURIComponent(this.query);
        } else {
            return "/object-fact-query/" + encodeURIComponent(this.objectType) + "/" + encodeURIComponent(this.objectValue);
        }
    }
}

export default SearchStore;