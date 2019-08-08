import { action, computed, observable } from 'mobx';
import MainPageStore from '../MainPageStore';
import getStyle from '../../core/cytoscapeStyle';
import { ActObject, Search, ActFact, isObjectSearch, isFactSearch } from '../types';

export type Node = {
  id: string | null;
  type: 'fact' | 'object';
};

class GraphViewStore {
  root: MainPageStore;

  renderThreshold: number = 2000;
  @observable resizeEvent = 0; // Used to trigger rerendering of the cytoscape element when it changes

  @observable selectedNode: Node = { type: 'fact', id: null };
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

  @computed
  get prepared() {
    const canRender =
      this.acceptRenderWarning || this.root.refineryStore.cytoscapeElements.length < this.renderThreshold;

    return {
      resizeEvent: this.resizeEvent,
      canRender: canRender,
      selectedNode: this.selectedNode.type === 'fact' ? 'edge-' + this.selectedNode.id : this.selectedNode.id,
      elements: this.root.refineryStore.cytoscapeElements,
      layout: this.root.ui.cytoscapeLayoutStore.graphOptions.layout.layoutObject,
      style: getStyle({ showEdgeLabels: this.root.ui.cytoscapeLayoutStore.graphOptions.showFactEdgeLabels }),
      onNodeClick: (node: any) => {
        this.setSelectedNode({
          id: node.data('isFact') ? node.data('factId') : node.id(),
          type: node.data('isFact') ? 'fact' : 'object'
        });
      },
      onNodeCtxClick: (node: any) => {
        this.setSelectedNode({
          id: node.data('isFact') ? node.data('factId') : node.id(),
          type: node.data('isFact') ? 'fact' : 'object'
        });
      },
      onNodeDoubleClick: (node: any) => {
        if (node.data('isFact')) return;

        this.root.backendStore.executeQuery({ objectType: node.data('type'), objectValue: node.data('value') });
      }
    };
  }

  @action
  setSelectedNode(value: Node) {
    this.selectedNode = value;
    this.root.ui.detailsStore.open();
  }

  @action
  setSelectedNodeBasedOnSearch(search: Search) {
    if (isObjectSearch(search)) {
      const searchedNode = Object.values(this.root.refineryStore.refined.objects).find(
        (object: ActObject) => object.type.name === search.objectType && object.value === search.objectValue
      );
      if (searchedNode && !search.query) {
        this.root.ui.cytoscapeStore.setSelectedNode({ id: searchedNode.id, type: 'object' });
      }
    } else if (isFactSearch(search)) {
      const searchedNode = Object.values(this.root.refineryStore.refined.facts).find(
        (fact: ActFact) => fact.id === search.id
      );
      if (searchedNode) {
        this.root.ui.cytoscapeStore.setSelectedNode({ id: searchedNode.id, type: 'fact' });
      }
    } else {
      // eslint-disable-next-line
      const _exhaustiveCheck: never = search;
    }
  }
}

export default GraphViewStore;
