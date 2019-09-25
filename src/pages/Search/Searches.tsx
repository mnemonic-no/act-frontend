import React from 'react';
import { Button, CircularProgress, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import { observer } from 'mobx-react';

import ObjectTable, { IObjectTableComp } from '../../components/ObjectTable';
import MultiSelect, { IMultiSelect } from '../../components/MultiSelect';

const useStyles = makeStyles((theme: Theme) => ({
  noSearches: {
    textAlign: 'center',
    padding: theme.spacing(10)
  },
  root: {
    overflowY: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  header: { marginLeft: theme.spacing(8), padding: '16px 10px 18px 0' },
  footer: {
    padding: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'row-reverse'
  },
  tableContainer: { overflowY: 'auto', flex: '1 1 auto' },
  titleContainer: { display: 'flex', alignItems: 'center' },
  objectTypeFilter: { paddingTop: theme.spacing(2) + 'px' },
  progress: { padding: theme.spacing(1) },
  selectButton: {
    padding: `${theme.spacing(1)}px 0`
  }
}));

const NoSearchesComp = ({ classes }: any) => {
  return (
    <div className={classes.noSearches}>
      <Typography variant="h5">You have no simple searches</Typography>
      <Typography variant="subtitle1">Try to run a simple search from the search box</Typography>
    </div>
  );
};

const SearchesComp = ({ searchResult }: ISearchesComp) => {
  const classes = useStyles();

  if (!searchResult) {
    return <NoSearchesComp classes={classes} />;
  }

  const { isLoading, title, subTitle, resultTable, onAddSelectedObjects, objectTypeFilter } = searchResult;

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.titleContainer}>
          <Typography variant="h6">{title}</Typography>
          {isLoading && <CircularProgress className={classes.progress} size={20} />}
        </div>
        <Typography variant="body1">{subTitle}</Typography>
        {!isLoading && (
          <div className={classes.objectTypeFilter}>
            <MultiSelect {...objectTypeFilter} />
          </div>
        )}
      </div>
      {!isLoading && (
        <div className={classes.tableContainer}>
          <ObjectTable {...resultTable} />
        </div>
      )}
      <div className={classes.footer}>
        <div className={classes.selectButton}>
          <Tooltip title="Add to working history">
            <Button size="small" color="secondary" variant="contained" onClick={onAddSelectedObjects}>
              Add selected objects
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

interface ISearchesComp {
  searchResult?: {
    title: string;
    subTitle: string;
    isLoading: boolean;
    onAddSelectedObjects: () => void;
    searchHistory: Array<string>;
    objectTypeFilter: IMultiSelect;
    resultTable: IObjectTableComp;
  };
}

export default observer(SearchesComp);
