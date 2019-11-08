import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import ObjectTable, { IObjectTableComp } from '../../components/ObjectTable';

const useStyles = makeStyles((theme: Theme) => ({
  empty: {
    textAlign: 'center',
    padding: theme.spacing(10)
  },
  root: {
    height: '100%',
    overflowY: 'auto'
  },
  header: {
    padding: '16px 10px 18px 80px',
    display: 'flex'
  }
}));

const PrunedObjectsTableComp = ({ objectTable, onClearButtonClick }: IPrunedObjectsTableComp) => {
  const classes = useStyles();

  if (objectTable.rows.length === 0) {
    return (
      <div className={classes.empty}>
        <Typography variant="h5">Nothing is pruned</Typography>
        <Typography variant="subtitle1">
          Select one or more objects in the graph or in one of the tables in order to prune
        </Typography>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Button variant="outlined" size="small" onClick={onClearButtonClick}>
          Unprune all
        </Button>
      </div>

      <ObjectTable {...objectTable} />
    </div>
  );
};

interface IPrunedObjectsTableComp {
  objectTable: IObjectTableComp;
  onClearButtonClick: () => void;
}

export default observer(PrunedObjectsTableComp);
