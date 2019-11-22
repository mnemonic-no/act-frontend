import { action, computed } from 'mobx';

import { IObjectTitleComp } from '../../components/ObjectTitle';
import { byTypeThenName, objectTypeToColor } from '../../util/util';
import AppStore from '../../AppStore';
import GraphQueryStore from '../../backend/GraphQueryStore';
import { TSectionComp } from './Section';

type TSectionConfig = {
  title: string;
  query: string;
};

interface IObjectTypeToSections {
  [objectType: string]: { sections: Array<TSectionConfig> };
}

export const prepareSections = (
  objectValue: string,
  objectTypeName: string,
  objectTypeToSections: IObjectTypeToSections,
  graphQueryStore: GraphQueryStore
): Array<TSectionComp> => {
  const sections = objectTypeToSections[objectTypeName] && objectTypeToSections[objectTypeName].sections;
  if (!sections) return [];

  return sections.map(({ title, query }: TSectionConfig) => {
    const q = graphQueryStore.getGraphQuery(objectValue, objectTypeName, query);

    if (q.status === 'pending') {
      return { kind: 'loading', title: title };
    }

    if (q.status === 'rejected') {
      return { kind: 'error', title: title, errorTitle: 'Query failed', errorMessage: q.errorDetails || '' };
    }

    if (q.objects && q.objects.length === 0) {
      return { kind: 'empty', title: title };
    }

    return {
      kind: 'table',
      title: title,
      titleRight: q.objects ? q.objects.length + '' : '',
      table: {
        rows: q.objects
          ? q.objects
              .slice()
              .sort(byTypeThenName)
              .map(o => ({ cells: [{ text: o.type.name, color: objectTypeToColor(o.type.name) }, { text: o.value }] }))
          : []
      }
    };
  });
};

class ObjectSummaryPageStore {
  root: AppStore;
  error: Error | null = null;

  currentObject: { typeName: string; value: string } | undefined;

  objectTypeToSections: IObjectTypeToSections = {};

  constructor(root: AppStore, config: any) {
    this.root = root;
    this.objectTypeToSections = config.objectSummary || {};
  }

  prepare(objectTypeName: string, objectValue: string) {
    this.currentObject = { typeName: objectTypeName, value: objectValue };

    const sections = this.objectTypeToSections[objectTypeName] && this.objectTypeToSections[objectTypeName].sections;

    if (sections) {
      sections.forEach(section => {
        this.root.backendStore.graphQueryStore.execute(objectValue, objectTypeName, section.query);
      });
    }
  }

  @action.bound
  openInGraphView() {
    if (!this.currentObject) return;
    this.root.navigateTo('mainPage');
    this.root.mainPageStore.backendStore.executeSearch({
      objectType: this.currentObject.typeName,
      objectValue: this.currentObject.value
    });
  }

  @computed
  get prepared() {
    return {
      pageMenu: this.root.pageMenu,
      error: {
        error: this.error,
        onClose: () => (this.error = null)
      },
      content: this.currentObject && {
        title: {
          title: this.currentObject.value,
          subTitle: this.currentObject.typeName,
          color: objectTypeToColor(this.currentObject.typeName)
        } as IObjectTitleComp,
        addToGraphButton: { text: 'Add to graph', tooltip: 'Add to graph view', onClick: this.openInGraphView },
        sections: prepareSections(
          this.currentObject.value,
          this.currentObject.typeName,
          this.objectTypeToSections,
          this.root.backendStore.graphQueryStore
        )
      }
    };
  }
}

export default ObjectSummaryPageStore;
