import { action, computed, observable } from 'mobx';
import layouts from '../../../Cytoscape/layouts';
import layoutConfigToObject from '../../../Cytoscape/layouts/layoutConfigToObject';

export type TCytoscapeLayout = {
  layoutName: string;
  layoutUrl: string;
  layoutConfig: any;
  layoutObject: any;
};

class CytoscapeLayoutStore {
  localStorage: Pick<Storage, 'getItem' | 'setItem'>;
  @observable layout: TCytoscapeLayout;
  @observable showLayoutOptions: boolean = false;
  @observable showFactEdgeLabels: boolean;
  @observable shortenObjectLabels: boolean;

  constructor(localStorage: Pick<Storage, 'getItem' | 'setItem'>) {
    this.localStorage = localStorage;
    this.showFactEdgeLabels = Boolean(JSON.parse(localStorage.getItem('options.showFactEdgeLabels') || 'false'));
    this.shortenObjectLabels = Boolean(JSON.parse(localStorage.getItem('options.shortenObjectLabels') || 'true'));
    this.layout = layouts.euler;
  }

  @action.bound
  setLayout(newLayout: TCytoscapeLayout) {
    this.layout = newLayout;
  }

  @action.bound
  toggleShowLayoutOptions() {
    this.showLayoutOptions = !this.showLayoutOptions;
  }

  @action.bound
  toggleShowFactEdgeLabels() {
    this.showFactEdgeLabels = !this.showFactEdgeLabels;
    localStorage.setItem('options.showFactEdgeLabels', JSON.stringify(this.showFactEdgeLabels));
  }

  @action.bound
  toggleShortenObjectLabels() {
    this.shortenObjectLabels = !this.shortenObjectLabels;
    localStorage.setItem('options.shortenObjectLabels', JSON.stringify(this.shortenObjectLabels));
  }

  @action.bound
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

  @computed
  get layoutConfigurator() {
    return {
      layout: this.layout,
      setLayout: this.setLayout,
      showLayoutOptions: this.showLayoutOptions,
      toggleShowLayoutOptions: this.toggleShowLayoutOptions,
      onLayoutConfigChange: this.onLayoutConfigChange
    };
  }

  @computed
  get toggles() {
    return [
      {
        label: 'Edges',
        labelSecondary: 'Show labels',
        onClick: this.toggleShowFactEdgeLabels,
        isChecked: this.showFactEdgeLabels
      },
      {
        label: 'Objects',
        labelSecondary: 'Shorten long labels',
        onClick: this.toggleShortenObjectLabels,
        isChecked: this.shortenObjectLabels
      }
    ];
  }
}

export default CytoscapeLayoutStore;
