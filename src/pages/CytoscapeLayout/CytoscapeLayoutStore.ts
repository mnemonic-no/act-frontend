import {action, observable} from "mobx";
import layouts from "../../Cytoscape/layouts";
import layoutConfigToObject from '../../Cytoscape/layouts/layoutConfigToObject';

type Layout = {
    layoutName: string,
    layoutUrl: string,
    layoutConfig: any,
    layoutObject: any
}

type GraphOptions = {
    layout: Layout,
    showFactEdgeLabels: boolean,
    showRetractions: boolean
}

class CytoscapeLayoutStore {

    @observable graphOptions: GraphOptions;
    @observable showLayoutOptions: boolean = false;

    constructor(localStorage : {getItem : Function}) {
        this.graphOptions = {
            layout: layouts.euler,
            showFactEdgeLabels: Boolean(
                JSON.parse(localStorage.getItem('options.showFactEdgeLabels'))
            ),
            showRetractions:
                localStorage.getItem('options.showRetractions') === null ?
                    true : Boolean(JSON.parse(localStorage.getItem('options.showRetractions')))
        };
    }

    @action
    setLayout(newLayout: Layout) {
        this.graphOptions.layout = newLayout;
    }

    @action
    toggleShowLayoutOptions() {
        this.showLayoutOptions = !this.showLayoutOptions;
    }

    @action
    toggleShowFactEdgeLabels() {
        this.graphOptions.showFactEdgeLabels = !this.graphOptions.showFactEdgeLabels;
        window.localStorage.setItem('options.showFactEdgeLabels', JSON.stringify(this.graphOptions.showFactEdgeLabels))
    }

    @action
    toggleShowRetractions() {
        this.graphOptions.showRetractions = !this.graphOptions.showRetractions;
        window.localStorage.setItem('options.showRetractions', JSON.stringify(this.graphOptions.showRetractions))
    }

    @action
    onLayoutConfigChange(layoutConfig: any) {
        const newLayout = {
            layoutName: this.graphOptions.layout.layoutName,
            layoutUrl: this.graphOptions.layout.layoutUrl,
            layoutConfig,
            // @ts-ignore
            layoutObject: layoutConfigToObject({
                layoutName: this.graphOptions.layout.layoutName,
                layoutConfig
            })
        };
        this.setLayout(newLayout);
    }
}

export default CytoscapeLayoutStore;