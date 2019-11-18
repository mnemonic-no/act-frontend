import React from 'react';
import { observer } from 'mobx-react';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import FactsTable from '../Table/FactsTable';
import FactsTableStore from '../Table/FactsTableStore';
import GraphView from '../GraphView/GraphView';
import GraphViewStore from '../GraphView/GraphViewStore';
import ObjectsTable from '../Table/ObjectsTable';
import ObjectsTableStore from '../Table/ObjectsTableStore';
import PrunedObjectsTable from '../Table/PrunedObjectsTable';
import PrunedObjectsTableStore from '../Table/PrunedObjectsTableStore';

const ContentComp = ({
  selectedTab,
  onTabSelected,
  graphViewStore,
  factsTableStore,
  objectsTableStore,
  prunedObjectsTableStore,
  rootClass
}: IContentComp) => {
  return (
    <main className={rootClass}>
      <Tabs value={selectedTab} onChange={(e: any, value: ContentTab) => onTabSelected(value)} indicatorColor="primary">
        <Tab label="Graph" value="graph" />
        <Tab label={`Table (${factsTableStore.facts.length})`} value="tableOfFacts" />
        <Tab label={`Objects (${objectsTableStore.objects.length})`} value="tableOfObjects" />
        <Tab label={`Pruned Objects (${prunedObjectsTableStore.prepared.rowCount})`} value="tableOfPrunedObjects" />
      </Tabs>

      {selectedTab === 'graph' && <GraphView store={graphViewStore} />}
      {selectedTab === 'tableOfFacts' && <FactsTable {...factsTableStore.prepared} />}
      {selectedTab === 'tableOfObjects' && <ObjectsTable {...objectsTableStore.prepared} />}
      {selectedTab === 'tableOfPrunedObjects' && <PrunedObjectsTable {...prunedObjectsTableStore.prepared} />}
    </main>
  );
};

export type ContentTab = 'tableOfFacts' | 'tableOfObjects' | 'tableOfPrunedObjects' | 'graph';

interface IContentComp {
  selectedTab: ContentTab;
  onTabSelected: (newTab: ContentTab) => void;
  graphViewStore: GraphViewStore;
  factsTableStore: FactsTableStore;
  objectsTableStore: ObjectsTableStore;
  prunedObjectsTableStore: PrunedObjectsTableStore;
  rootClass: any;
}

export default observer(ContentComp);
