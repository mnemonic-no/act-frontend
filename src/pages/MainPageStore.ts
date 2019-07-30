import {action, computed, observable} from "mobx";

import BackendStore from "./BackendStore";
import config from "../config";
import CytoscapeLayoutStore from "./CytoscapeLayout/CytoscapeLayoutStore";
import DetailsStore from './Details/DetailsStore';
import FactsTableStore from "./Table/FactsTableStore";
import GraphViewStore from "./GraphView/GraphViewStore";
import ObjectsTableStore from "./Table/ObjectsTableStore";
import QueryHistory from './QueryHistory';
import QueryHistoryStore from "./QueryHistory/QueryHistoryStore";
import RefineryOptionsStore from "./RefineryOptions/RefineryOptionsStore";
import RefineryStore from "./RefineryStore";
import SearchStore from "./Search/SearchStore";

const locationDefinitions = (routeDefinitions: any) => {
    return (location : Location) => {
        Object.entries(routeDefinitions).forEach( ([k,v]) => {
            const re = RegExp(k);

            const match = re.exec(location.pathname);

            if (match && match.length > 1) {
                // @ts-ignore
                const pathValues = match.slice(1).map(x => decodeURIComponent(x));
                // @ts-ignore
                v(...pathValues);
                return;
            }
        });
    }
};

class MainPageStore {

    ui: {
        cytoscapeLayoutStore: CytoscapeLayoutStore,
        cytoscapeStore: GraphViewStore,
        detailsStore: DetailsStore,
        refineryOptionsStore: RefineryOptionsStore,
        searchStore: SearchStore,
        queryHistoryStore: QueryHistoryStore,
        factsTableStore: FactsTableStore
        objectsTableStore: ObjectsTableStore
    };

    @observable error: Error | null = null;

    backendStore: BackendStore;
    queryHistory: QueryHistory; // TODO confusing name, might mistake for queryHistoryStore
    refineryStore: RefineryStore;

    constructor() {
        this.backendStore = new BackendStore(this);
        this.queryHistory = new QueryHistory(this);
        this.refineryStore = new RefineryStore(this);
        this.ui = {
            cytoscapeLayoutStore: new CytoscapeLayoutStore(window.localStorage),
            cytoscapeStore: new GraphViewStore(this),

            detailsStore: new DetailsStore(this, config),
            refineryOptionsStore: new RefineryOptionsStore(this),
            searchStore: new SearchStore(this, config),
            queryHistoryStore: new QueryHistoryStore(this),
            factsTableStore: new FactsTableStore(this),
            objectsTableStore: new ObjectsTableStore(this)
        };
    }

    initByUrl(location: Location) : void {
        const locationMatcher = locationDefinitions({
            "/object-fact-query/(.+)/(.+?)(/)?$" : (objectType : string, objectValue : string) => { this.backendStore.executeQuery({objectType: objectType, objectValue: objectValue})},
            "/gremlin/(.+)/(.+)/(.+?)(/)?$" : (objectType : string, objectValue: string, query: string) => { this.backendStore.executeQuery({objectType: objectType, objectValue: objectValue, query: query})},
            "/graph-query/(.+)/(.+)/(.+?)(/)?$" : (objectType : string, objectValue: string, query: string) => { this.backendStore.executeQuery({objectType: objectType, objectValue: objectValue, query: query})}
        });

        locationMatcher(location);
    }

    @action.bound
    initByImport(rawImportJson: any) : void {
        this.backendStore.executeQueries(rawImportJson.queries);
    }

    @action.bound
    handleError({error, title} : {error: Error, title?: string}) {
        if (title) {
            // @ts-ignore
            error.title = title
        }
        this.error = error
    }

    @computed
    get errorSnackbar()  {
        return {
            error: this.error,
            onClose: () => this.error = null
        }
    }
}

export default MainPageStore;