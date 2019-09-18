import React from 'react';
import { Button, makeStyles, Theme, Tooltip } from '@material-ui/core';
import { observer } from 'mobx-react';
import Typography from '@material-ui/core/Typography';
import ObjectTable, { ColumnKind, IObjectRow, SortOrder } from '../../components/ObjectTable';
import { ActObject } from '../types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  header: { marginLeft: theme.spacing(8), padding: '16px 10px 18px 0' },
  tableContainer: {},
  selectButton: {
    padding: `${theme.spacing(1)}px 0`
  }
}));

const SearchesComp = ({ resultTable }: ISearchesComp) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h6">Search: xzy</Typography>
        <div className={classes.selectButton}>
          <Tooltip title="Add to working history">
            <Button size="small" variant="outlined" onClick={() => {}}>
              Select objects
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className={classes.tableContainer}>
        <ObjectTable {...resultTable} />
      </div>
    </div>
  );
};

interface ISearchesComp {
  resultTable: {
    rows: Array<IObjectRow>;
    sortOrder: SortOrder;
    onSortChange: (ck: ColumnKind) => void;
    onRowClick: (obj: ActObject) => void;
  };
}

export default observer(SearchesComp);
