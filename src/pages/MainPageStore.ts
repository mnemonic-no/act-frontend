import GraphViewStore from "./GraphView/GraphViewStore";
import CytoscapeLayoutStore from "./CytoscapeLayout/CytoscapeLayoutStore";
import DetailsStore from './Details/DetailsStore';
import QueryHistoryStore from "./QueryHistory/QueryHistoryStore";
import QueryHistory from './QueryHistory';
import SearchStore from "./Search/SearchStore";
import RefineryStore from "./RefineryStore";
import RefineryOptionsStore from "./RefineryOptions/RefineryOptionsStore";
import TableStore from "./Table/TableStore";
import BackendStore from "./BackendStore";
import config from "../config";
import {Search} from "./types";

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
        tableStore: TableStore
    };

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
            searchStore: new SearchStore(this),
            queryHistoryStore: new QueryHistoryStore(this),
            tableStore: new TableStore(this)
        };
    }

    executeQuery(search: Search) {
        this.ui.searchStore.executeSearch(search);
    }

    initByUrl(location: Location) : void {
        const locationMatcher = locationDefinitions({
            "/object-fact-query/(.+)/(.+?)(/)?$" : (objectType : string, objectValue : string) => { this.executeQuery({objectType: objectType, objectValue: objectValue})},
            "/gremlin/(.+)/(.+)/(.+?)(/)?$" : (objectType : string, objectValue: string, query: string) => { this.executeQuery({objectType: objectType, objectValue: objectValue, query: query})},
            "/graph-query/(.+)/(.+)/(.+?)(/)?$" : (objectType : string, objectValue: string, query: string) => { this.executeQuery({objectType: objectType, objectValue: objectValue, query: query})}
        });

        locationMatcher(location);
    }
}

export default MainPageStore;