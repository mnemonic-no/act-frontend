import React from 'react';
import { Button, CircularProgress, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import { observer } from 'mobx-react';

import ObjectTable, { ColumnKind, IObjectRow, SortOrder } from '../../components/ObjectTable';
import { ActObject } from '../types';

const useStyles = makeStyles((theme: Theme) => ({
  root: { overflowY: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' },
  header: { marginLeft: theme.spacing(8), padding: '16px 10px 18px 0' },
  titleContainer: { display: 'flex', alignItems: 'center' },
  progress: { padding: theme.spacing(1) },
  tableContainer: { overflowY: 'auto', flex: '0 1 auto' },
  selectButton: {
    padding: `${theme.spacing(1)}px 0`
  }
}));

const SearchesComp = ({ isLoading, title, subTitle, resultTable, onAddSelectedObjects }: ISearchesComp) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.titleContainer}>
          <Typography variant="h6">{title}</Typography>
          {isLoading && <CircularProgress className={classes.progress} size={20} />}
        </div>
        <Typography variant="body1">{subTitle}</Typography>
        <div className={classes.selectButton}>
          <Tooltip title="Add to working history">
            <Button size="small" color="secondary" variant="contained" onClick={onAddSelectedObjects}>
              Add selected objects
            </Button>
          </Tooltip>
        </div>
      </div>
      {!isLoading && (
        <div className={classes.tableContainer}>
          <ObjectTable {...resultTable} />
        </div>
      )}
    </div>
  );
};

interface ISearchesComp {
  title: string;
  subTitle: string;
  isLoading: boolean;
  onAddSelectedObjects: () => void;
  resultTable: {
    rows: Array<IObjectRow>;
    sortOrder: SortOrder;
    onSortChange: (ck: ColumnKind) => void;
    onRowClick: (obj: ActObject) => void;
  };
}

export default observer(SearchesComp);
