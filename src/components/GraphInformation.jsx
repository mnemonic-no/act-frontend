import React from 'react';
import { observer } from 'mobx-react';
import { compose, withProps, withState } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import graphInformation from '../state/graphInformation';
import ObjectInformation from './ObjectInformation';
import FactInformation from './FactInformation';
import ObjectsTable from './ObjectsTable';
import FactsTable from './FactsTable';

const nodeInformationHeight = 360;
const styles = theme => ({
  root: {
    height: '100%',
    position: 'relative'
  },
  nodeInformation: {
    position: 'relative',
    height: nodeInformationHeight,
    overflowY: 'scroll'
  },
  table: {
    position: 'relative',
    // Subtract height from info box, tab, and divider
    height: `calc(100% - ${nodeInformationHeight}px - ${theme.spacing.unit *
      6}px - 1px)`,
    overflowY: 'scroll'
  }
});

const GraphInformationComp = ({
  classes,
  graphInformation,
  selectedTab,
  setSelectedTab,
  onSearchSubmit
}) => (
  <div className={classes.root}>
    {/* Node info */}
    <div className={classes.nodeInformation}>
      {graphInformation.selectedNode.id !== null &&
        (graphInformation.selectedNode.type === 'object' ? (
          <ObjectInformation
            id={graphInformation.selectedNode.id}
            {...{ onSearchSubmit }}
          />
        ) : (
          <FactInformation
            id={graphInformation.selectedNode.id}
            {...{ onSearchSubmit }}
          />
        ))}
    </div>

    <Divider />
    {/* Objects table */}
    <Tabs
      value={selectedTab}
      onChange={(e, value) => setSelectedTab(value)}
      indicatorColor='primary'
    >
      <Tab
        label={`Objects (${graphInformation.objectsData.length})`}
        value='objects'
      />
      <Tab
        label={`Facts (${graphInformation.factsData.length})`}
        value='facts'
      />
    </Tabs>

    <div className={classes.table}>
      {selectedTab === 'objects' && <ObjectsTable />}
      {selectedTab === 'facts' && <FactsTable />}
    </div>
  </div>
);

export default compose(
  withStyles(styles),
  withState('selectedTab', 'setSelectedTab', 'objects'),
  withProps({ graphInformation }),
  observer
)(GraphInformationComp);
