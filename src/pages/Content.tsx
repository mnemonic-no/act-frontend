import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Tab, Tabs, Theme } from '@material-ui/core';

import GraphView from './GraphView/GraphView';
import Timeline from '../components/Timeline/Timeline';
import FactsTable from './Table/FactsTable';
import ObjectsTable from './Table/ObjectsTable';
import PrunedObjectsTable from './Table/PrunedObjectsTable';
import FactsTableStore from './Table/FactsTableStore';
import ObjectsTableStore from './Table/ObjectsTableStore';
import PrunedObjectsTableStore from './Table/PrunedObjectsTableStore';
import GraphViewStore from './GraphView/GraphViewStore';

const useStyles = makeStyles((theme: Theme) => {
  return {
    graphRoot: { flex: '1 0 auto', display: 'flex', flexDirection: 'column' },
    graph: { flex: '1 0 auto' },
    timeline: { flex: '0 0 200px', borderTop: `1px solid ${theme.palette.divider}` }
  };
});

const ContentComp = ({
  cytoscapeStore,
  factsTableStore,
  objectsTableStore,
  prunedObjectsTableStore,
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
        <Tab label={`Pruned objects (${prunedObjectsTableStore.prepared.rows.length})`} value="tableOfPrunedObjects" />
      </Tabs>

      {selectedTab === 'graph' && (
        <div className={classes.graphRoot}>
          <div className={classes.graph}>
            <GraphView store={cytoscapeStore} />
          </div>
          <div className={classes.timeline}>
            <Timeline {...cytoscapeStore.timeline} />
          </div>
        </div>
      )}
      {selectedTab === 'tableOfFacts' && <FactsTable {...factsTableStore.prepared} />}
      {selectedTab === 'tableOfObjects' && <ObjectsTable {...objectsTableStore.prepared} />}
      {selectedTab === 'tableOfPrunedObjects' && <PrunedObjectsTable {...prunedObjectsTableStore.prepared} />}
    </main>
  );
};

interface IContentComp {
  cytoscapeStore: GraphViewStore;
  factsTableStore: FactsTableStore;
  objectsTableStore: ObjectsTableStore;
  prunedObjectsTableStore: PrunedObjectsTableStore;
  rootClass: any;
}

export default observer(ContentComp);
