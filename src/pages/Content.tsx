import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Tab, Tabs, Theme } from '@material-ui/core';

import FactsTable from './Table/FactsTable';
import FactsTableStore from './Table/FactsTableStore';
import GraphView from './GraphView/GraphView';
import GraphViewStore from './GraphView/GraphViewStore';
import ObjectsTable from './Table/ObjectsTable';
import ObjectsTableStore from './Table/ObjectsTableStore';
import PrunedObjectsTable from './Table/PrunedObjectsTable';
import PrunedObjectsTableStore from './Table/PrunedObjectsTableStore';
import Searches from './Search/Searches';
import SearchesStore from './Search/SearchesStore';
import Timeline from '../components/Timeline/Timeline';

const useStyles = makeStyles((theme: Theme) => {
  return {
    graphRoot: { flex: '1 0 auto', display: 'flex', flexDirection: 'column' },
    graph: { flex: '1 0 auto' },
    timeline: { flex: '0 0 200px', borderTop: `1px solid ${theme.palette.divider}` }
  };
});

const ContentComp = ({
  graphViewStore,
  factsTableStore,
  objectsTableStore,
  prunedObjectsTableStore,
  searchesStore,
  isSimpleSearchEnabled,
  rootClass
}: IContentComp) => {
  const [selectedTab, setSelectedTab] = useState('graph');

  const classes = useStyles();

  return (
    <main className={rootClass}>
      <Tabs value={selectedTab} onChange={(e: any, value: string) => setSelectedTab(value)} indicatorColor="primary">
        <Tab label="Graph" value="graph" />
        <Tab label={`Table (${factsTableStore.facts.length})`} value="tableOfFacts" />
        <Tab label={`Objects (${objectsTableStore.objects.length})`} value="tableOfObjects" />
        <Tab label={`Pruned objects (${prunedObjectsTableStore.prepared.rowCount})`} value="tableOfPrunedObjects" />
        {isSimpleSearchEnabled && <Tab label={`Searches`} value="searches" />}
      </Tabs>

      {selectedTab === 'graph' && (
        <div className={classes.graphRoot}>
          <div className={classes.graph}>
            <GraphView store={graphViewStore} />
          </div>
          <div className={classes.timeline}>
            <Timeline {...graphViewStore.timeline} />
          </div>
        </div>
      )}
      {selectedTab === 'tableOfFacts' && <FactsTable {...factsTableStore.prepared} />}
      {selectedTab === 'tableOfObjects' && <ObjectsTable {...objectsTableStore.prepared} />}
      {selectedTab === 'tableOfPrunedObjects' && <PrunedObjectsTable {...prunedObjectsTableStore.prepared} />}
      {selectedTab === 'searches' && <Searches {...searchesStore.prepared} />}
    </main>
  );
};

interface IContentComp {
  graphViewStore: GraphViewStore;
  factsTableStore: FactsTableStore;
  objectsTableStore: ObjectsTableStore;
  prunedObjectsTableStore: PrunedObjectsTableStore;
  searchesStore: SearchesStore;
  isSimpleSearchEnabled: boolean;
  rootClass: any;
}

export default observer(ContentComp);
