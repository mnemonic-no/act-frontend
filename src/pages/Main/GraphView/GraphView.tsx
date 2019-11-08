import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Typography from '@material-ui/core/Typography';
import WarnIcon from '@material-ui/icons/Warning';

import CytoscapeComp from '../../../Cytoscape/Cytoscape';
import GraphViewStore from './GraphViewStore';
import Timeline from '../../../components/Timeline/Timeline';

const useStyles = makeStyles((theme: Theme) => ({
  root: { flex: '1 0 auto', display: 'flex', flexDirection: 'column' },
  graph: { flex: '1 0 auto', position: 'relative' },
  timeline: { flex: '0 0 auto', borderTop: `1px solid ${theme.palette.divider}` },
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
  },
  toggleButton: {
    background: theme.palette.common.white,
    borderColor: theme.palette.divider,
    borderStyle: 'solid',
    position: 'absolute',
    bottom: '-1px',
    left: '10px',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    borderWidth: '1px 1px 0 1px'
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

  return (
    <div className={classes.root}>
      <div className={classes.graph}>
        {store.prepared.canRender ? (
          <CytoscapeComp {...store.prepared} />
        ) : (
          <RenderWarning classes={classes} onClick={() => store.acceptRenderWarningOnClick()} />
        )}
        <div className={classes.toggleButton}>
          <IconButton onClick={store.toggleShowTimeline}>
            {store.showTimeline ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          </IconButton>
        </div>
      </div>
      {store.showTimeline && (
        <div className={classes.timeline}>
          <Timeline {...store.timeline} />
        </div>
      )}
    </div>
  );
};

interface IGraphView {
  store: GraphViewStore;
}

export default observer(GraphView);
