import { action, computed, observable } from 'mobx';
import MainPageStore from '../MainPageStore';
import getStyle from '../../core/cytoscapeStyle';
import { ActFact, ActObject, ActSelection, isFactSearch, isObjectSearch, Search } from '../types';
import * as _ from 'lodash/fp';

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

  selectedCytoscapeNode(selection: ActSelection | null) {
    if (!selection) return null;
    return selection.kind === 'fact' ? 'edge-' + selection.id : selection.id;
  }

  @computed
  get prepared() {
    const canRender =
      this.acceptRenderWarning || this.root.refineryStore.cytoscapeElements.length < this.renderThreshold;

    return {
      resizeEvent: this.resizeEvent,
      canRender: canRender,
      selectedNode: this.selectedCytoscapeNode(this.root.currentSelection),
      elements: this.root.refineryStore.cytoscapeElements,
      layout: this.root.ui.cytoscapeLayoutStore.graphOptions.layout.layoutObject,
      style: getStyle({ showEdgeLabels: this.root.ui.cytoscapeLayoutStore.graphOptions.showFactEdgeLabels }),
      onNodeClick: (node: any) => {
        this.root.setCurrentSelection({
          id: node.data('isFact') ? node.data('factId') : node.id(),
          kind: node.data('isFact') ? 'fact' : 'object'
        });
      },
      onNodeCtxClick: (node: any) => {
        this.root.setCurrentSelection({
          id: node.data('isFact') ? node.data('factId') : node.id(),
          kind: node.data('isFact') ? 'fact' : 'object'
        });
      },
      onNodeDoubleClick: (node: any) => {
        if (node.data('isFact')) return;

        this.root.backendStore.executeQuery({ objectType: node.data('type'), objectValue: node.data('value') });
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
        this.root.setCurrentSelection({ id: searchedNode.id, kind: 'object' });
      }
    } else if (isFactSearch(search)) {
      const searchedNode = Object.values(this.root.refineryStore.refined.facts).find(
        (fact: ActFact) => fact.id === search.id
      );
      if (searchedNode) {
        this.root.setCurrentSelection({ id: searchedNode.id, kind: 'fact' });
      }
    } else {
      // eslint-disable-next-line
      const _exhaustiveCheck: never = search;
    }
  }

  @computed
  get timeRange(): [Date, Date] {
    return [new Date(2013, 0, 1), new Date(2016, 0, 1)];
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
