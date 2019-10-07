import React from 'react';
import { observer } from 'mobx-react';
import { Tab, Tabs } from '@material-ui/core';

import FactsTable from '../Table/FactsTable';
import FactsTableStore from '../Table/FactsTableStore';
import GraphView from '../GraphView/GraphView';
import GraphViewStore from '../GraphView/GraphViewStore';
import ObjectsTable from '../Table/ObjectsTable';
import ObjectsTableStore from '../Table/ObjectsTableStore';
import PrunedObjectsTable from '../Table/PrunedObjectsTable';
import PrunedObjectsTableStore from '../Table/PrunedObjectsTableStore';
import Searches from '../Search/Searches';
import SearchesStore from '../Search/SearchesStore';

const ContentComp = ({
  selectedTab,
  onTabSelected,
  graphViewStore,
  factsTableStore,
  objectsTableStore,
  prunedObjectsTableStore,
  searchesStore,
  rootClass
}: IContentComp) => {
  return (
    <main className={rootClass}>
      <Tabs value={selectedTab} onChange={(e: any, value: ContentTab) => onTabSelected(value)} indicatorColor="primary">
        <Tab label="Graph" value="graph" />
        <Tab label={`Table (${factsTableStore.facts.length})`} value="tableOfFacts" />
        <Tab label={`Objects (${objectsTableStore.objects.length})`} value="tableOfObjects" />
        <Tab label={`Pruned objects (${prunedObjectsTableStore.prepared.rowCount})`} value="tableOfPrunedObjects" />
        <Tab label={`Searches`} value="searches" />
      </Tabs>

      {selectedTab === 'graph' && <GraphView store={graphViewStore} />}
      {selectedTab === 'tableOfFacts' && <FactsTable {...factsTableStore.prepared} />}
      {selectedTab === 'tableOfObjects' && <ObjectsTable {...objectsTableStore.prepared} />}
      {selectedTab === 'tableOfPrunedObjects' && <PrunedObjectsTable {...prunedObjectsTableStore.prepared} />}
      {selectedTab === 'searches' && <Searches {...searchesStore.prepared} />}
    </main>
  );
};

export type ContentTab = 'tableOfFacts' | 'tableOfObjects' | 'tableOfPrunedObjects' | 'searches' | 'graph';

interface IContentComp {
  selectedTab: ContentTab;
  onTabSelected: (newTab: ContentTab) => void;
  graphViewStore: GraphViewStore;
  factsTableStore: FactsTableStore;
  objectsTableStore: ObjectsTableStore;
  prunedObjectsTableStore: PrunedObjectsTableStore;
  searchesStore: SearchesStore;
  rootClass: any;
}

export default observer(ContentComp);
