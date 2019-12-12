import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import WarnIcon from '@material-ui/icons/Warning';

import MultiSelect, { IMultiSelect } from '../../../components/MultiSelect';
import ObjectTable, { IObjectTableComp } from '../../../components/ObjectTable';

const useStyles = makeStyles((theme: Theme) => ({
  warning: {
    textAlign: 'center',
    padding: theme.spacing(10)
  },
  fillFlex: {
    flex: '1 0 auto'
  },
  root: {
    overflowY: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  header: {
    padding: '16px 10px 18px 16px',
    display: 'flex',
    justifyContent: 'space-between'
  },
  titleContainer: { display: 'flex', alignItems: 'center' },
  tableContainer: { overflowY: 'auto', flex: '1 1 auto' },
  objectTypeFilter: { paddingTop: theme.spacing(2) + 'px' },
  progress: { padding: theme.spacing(1) },
  selectButton: {
    padding: `${theme.spacing(1)}px 0`
  },
  errorRetry: {
    paddingTop: theme.spacing(2)
  },
  warningContainer: {
    display: 'flex',
    color: theme.palette.secondary.dark
  }
}));

const SearchErrorComp = ({ classes, title, subTitle, onRetryClick }: ISearchError & { classes: any }) => {
  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.titleContainer}>
          <Typography variant="h6">{title}</Typography>
          <WarnIcon color="error" />
        </div>

        <Typography variant="subtitle1" color={'error'}>
          {subTitle}
        </Typography>

        <div className={classes.errorRetry}>
          <Tooltip title={'Retry the current search'}>
            <Button variant="outlined" size="small" onClick={onRetryClick}>
              Retry
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

const CenteredWarningComp = ({ classes, title, subTitle }: { classes: any; title: string; subTitle: string }) => {
  return (
    <div className={classes.warning}>
      <Typography variant="h5">{title}</Typography>
      <Typography variant="subtitle1">{subTitle}</Typography>
    </div>
  );
};

const ResultsComp = (props: IResultsComp) => {
  const classes = useStyles();

  if (props.searchError) {
    return <SearchErrorComp {...props.searchError} classes={classes} />;
  }

  if (!props.searchResult) {
    return <div>No results</div>;
  }

  const { isLoading, title, subTitles, isResultEmpty, resultTable, warningText, objectTypeFilter } = props.searchResult;

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div>
          <div className={classes.titleContainer}>
            <Typography variant="h6">{title}</Typography>
            {isLoading && <CircularProgress className={classes.progress} size={20} />}
          </div>
          {subTitles.map(x => {
            return (
              <Typography key={x.text} variant="body1" style={{ color: x.color }}>
                {x.text}
              </Typography>
            );
          })}
          {warningText && (
            <div className={classes.warningContainer}>
              <WarnIcon color="secondary" />
              <Typography variant="subtitle1">{warningText}</Typography>
            </div>
          )}
          {!isLoading && !isResultEmpty && objectTypeFilter && (
            <div className={classes.objectTypeFilter}>
              <MultiSelect {...objectTypeFilter} />
            </div>
          )}
        </div>
      </div>
      {!isLoading && isResultEmpty && (
        <div className={classes.fillFlex}>
          <CenteredWarningComp classes={classes} title="There were no result" subTitle="Try to refine your search" />
        </div>
      )}
      {!isLoading && !isResultEmpty && (
        <div className={classes.tableContainer}>
          <ObjectTable {...resultTable} />
        </div>
      )}
    </div>
  );
};

interface ISearchError {
  title: string;
  subTitle: string;
  onRetryClick: () => void;
}

export interface IColorText {
  text: string;
  color?: string;
}

export interface IResultsComp {
  searchError?: ISearchError;
  searchResult?: {
    title: string;
    subTitles: Array<IColorText>;
    isLoading: boolean;
    warningText?: string;
    objectTypeFilter?: IMultiSelect;
    isResultEmpty: boolean;
    resultTable: IObjectTableComp;
  };
}

export default observer(ResultsComp);
