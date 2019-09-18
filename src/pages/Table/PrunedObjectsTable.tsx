import React from 'react';
import { observer } from 'mobx-react';
import { ActObject } from '../types';
import { makeStyles, Theme } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ObjectTable, { ColumnKind, IObjectRow, SortOrder } from '../../components/ObjectTable';

const useStyles = makeStyles((theme: Theme) => ({
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
  objectTable: {
    rows: Array<IObjectRow>;
    sortOrder: SortOrder;
    onSortChange: (ck: ColumnKind) => void;
    onRowClick: (obj: ActObject) => void;
  };
  onClearButtonClick: () => void;
}

export default observer(PrunedObjectsTableComp);
