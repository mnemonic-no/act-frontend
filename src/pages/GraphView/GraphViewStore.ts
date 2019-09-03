import { action, computed, observable } from 'mobx';
import MainPageStore from '../MainPageStore';
import getStyle from '../../core/cytoscapeStyle';
import { ActFact, ActObject, ActSelection, isFactSearch, isObjectSearch, QueryResult, Search } from '../types';
import * as _ from 'lodash/fp';
import { objectFactsToElements } from '../../core/cytoscapeTransformers';
import config from '../../config';

const cytoscapeNodeToNode = (cytoNode: any): ActSelection => {
  return {
    id: cytoNode.data('isFact') ? cytoNode.data('factId') : cytoNode.id(),
    kind: cytoNode.data('isFact') ? 'fact' : 'object'
  };
};

class GraphViewStore {
  root: MainPageStore;

  renderThreshold: number = 2000;
  @observable resizeEvent = 0; // Used to trigger rerendering of the cytoscape element when it changes
  @observable acceptRenderWarning = false;

  constructor(root: MainPageStore) {
    this.root = root;
  }

  @action
  acceptRenderWarningOnClick() {
    this.acceptRenderWarning = true;
  }

  @action.bound rerender() {
    this.resizeEvent = new Date().getTime();
  }

  @computed get cytoscapeElements() {
    const res: QueryResult = this.root.refineryStore.refined;

    return objectFactsToElements({
      facts: Object.values(res.facts),
      objects: Object.values(res.objects),
      objectLabelFromFactType: config.objectLabelFromFactType
    });
  }

  @computed
  get prepared() {
    const canRender = this.acceptRenderWarning || this.cytoscapeElements.length < this.renderThreshold;

    return {
      canRender: canRender,
      resizeEvent: this.resizeEvent,
      selectedNodeIds: new Set(Object.values(this.root.selectionStore.currentlySelected).map(x => x.id)),
      elements: this.cytoscapeElements,
      layout: this.root.ui.cytoscapeLayoutStore.graphOptions.layout.layoutObject,
      layoutConfig: this.root.ui.cytoscapeLayoutStore.graphOptions.layout.layoutObject,
      style: getStyle({ showEdgeLabels: this.root.ui.cytoscapeLayoutStore.graphOptions.showFactEdgeLabels }),
      onNodeClick: (node: any) => {
        this.root.selectionStore.setCurrentSelection(cytoscapeNodeToNode(node));
      },
      onNodeCtxClick: (node: any) => {
        this.root.selectionStore.setCurrentSelection({
          id: node.id(),
          kind: node.data('isFact') ? 'fact' : 'object'
        });
      },
      onNodeDoubleClick: (node: any) => {
        if (node.data('isFact')) return;

        this.root.backendStore.executeQuery({ objectType: node.data('type'), objectValue: node.data('value') });
      },
      onSelectionChange: (selection: Array<any>) => {
        this.root.selectionStore.setCurrentlySelected(
          selection.map(cytoscapeNodeToNode).reduce((acc: any, x: any) => ({ ...acc, [x.id]: x }), {})
        );
      }
    };
  }

  @action
  setSelectedNodeBasedOnSearch(search: Search) {
    if (isObjectSearch(search)) {
      const searchedNode = Object.values(this.root.refineryStore.refined.objects).find(
        (object: ActObject) => object.type.name === search.objectType && object.value === search.objectValue
      );
      if (searchedNode && !search.query) {
        this.root.selectionStore.setCurrentSelection({ id: searchedNode.id, kind: 'object' });
      }
    } else if (isFactSearch(search)) {
      const searchedNode = Object.values(this.root.refineryStore.refined.facts).find(
        (fact: ActFact) => fact.id === search.id
      );
      if (searchedNode) {
        this.root.selectionStore.setCurrentSelection({ id: searchedNode.id, kind: 'fact' });
      }
    } else {
      // eslint-disable-next-line
      const _exhaustiveCheck: never = search;
    }
  }

  @computed
  get timeline() {
    const timeData = _.map((f: ActFact) => ({ value: new Date(f.timestamp) }))(
      Object.values(this.root.refineryStore.refined.facts)
    );

    return {
      resizeEvent: this.resizeEvent,
      timeRange: this.root.refineryStore.timeRange,
      data: timeData
    };
  }
}

export default GraphViewStore;
