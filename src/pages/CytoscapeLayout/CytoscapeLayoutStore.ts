import { action, observable } from 'mobx';
import layouts from '../../Cytoscape/layouts';
import layoutConfigToObject from '../../Cytoscape/layouts/layoutConfigToObject';

type Layout = {
  layoutName: string;
  layoutUrl: string;
  layoutConfig: any;
  layoutObject: any;
};

class CytoscapeLayoutStore {
  @observable layout: Layout;
  @observable showLayoutOptions: boolean = false;
  localStorage: Pick<Storage, 'getItem' | 'setItem'>;
  @observable showFactEdgeLabels: boolean;

  constructor(localStorage: Pick<Storage, 'getItem' | 'setItem'>) {
    this.localStorage = localStorage;
    this.showFactEdgeLabels = Boolean(JSON.parse(localStorage.getItem('options.showFactEdgeLabels') || 'false'));
    this.layout = layouts.euler;
  }

  @action
  setLayout(newLayout: Layout) {
    this.layout = newLayout;
  }

  @action
  toggleShowLayoutOptions() {
    this.showLayoutOptions = !this.showLayoutOptions;
  }

  @action
  toggleShowFactEdgeLabels() {
    this.showFactEdgeLabels = !this.showFactEdgeLabels;
    localStorage.setItem('options.showFactEdgeLabels', JSON.stringify(this.showFactEdgeLabels));
  }

  @action
  onLayoutConfigChange(layoutConfig: any) {
    const newLayout = {
      layoutName: this.layout.layoutName,
      layoutUrl: this.layout.layoutUrl,
      layoutConfig,
      layoutObject: layoutConfigToObject({
        layoutName: this.layout.layoutName,
        layoutConfig
      })
    };
    this.setLayout(newLayout);
  }
}

export default CytoscapeLayoutStore;
