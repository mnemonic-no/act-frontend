import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import WarnIcon from '@material-ui/icons/Warning';
import Button from '@material-ui/core/Button';

import CytoscapeComp from '../../Cytoscape/Cytoscape';
import GraphViewStore from './GraphViewStore';

const useStyles = makeStyles((theme: Theme) => ({
  warning: {
    padding: '20px',
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },

  warningButton: {
    paddingTop: '20px'
  }
}));

const RenderWarning = ({ classes, onClick }: { classes: any; onClick: Function }) => (
  <div className={classes.warning}>
    <WarnIcon color="secondary" style={{ fontSize: 90 }} />
    <Typography variant="h2">Large result set</Typography>
    <Typography variant="h5">Please adjust your queries to see the graph</Typography>
    <div className={classes.warningButton}>
      <Button variant="outlined" size="large" onClick={() => onClick()}>
        I want to try anyway
      </Button>
    </div>
  </div>
);

const GraphView = ({ store }: IGraphView) => {
  const classes = useStyles();

  if (store.prepared.canRender) {
    return <CytoscapeComp {...store.prepared} />;
  } else {
    return <RenderWarning classes={classes} onClick={() => store.acceptRenderWarningOnClick()} />;
  }
};

interface IGraphView {
  store: GraphViewStore;
}

export default observer(GraphView);
