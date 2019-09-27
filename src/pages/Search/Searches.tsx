import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  ClickAwayListener,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Paper,
  Popper,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core';
import { observer } from 'mobx-react';
import WarnIcon from '@material-ui/icons/Warning';

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
  header: {
    marginLeft: theme.spacing(8),
    padding: '16px 10px 18px 0',
    display: 'flex',
    justifyContent: 'space-between'
  },
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
  },
  errorRetry: {
    paddingTop: theme.spacing(2)
  },
  warningContainer: {
    display: 'flex',
    color: theme.palette.secondary.dark
  }
}));

const useHistoryStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    zIndex: 900
  },
  popperRoot: {
    maxWidth: '350px',
    minWidth: '300px',
    overflowY: 'auto',
    maxHeight: '60vh'
  },
  ellipsisText: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  labelSecondary: {
    paddingLeft: theme.spacing(1)
  },
  spacedOut: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}));

const HistoryComp = ({ historyItems }: { historyItems: Array<SearchHistoryItem> }) => {
  const classes = useHistoryStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div
      className={classes.root}
      ref={node => {
        setAnchorEl(node);
      }}>
      <Tooltip title="Show search history">
        <span>
          <ClickAwayListener onClickAway={() => setHistoryOpen(false)}>
            <Button variant="outlined" onClick={() => setHistoryOpen(!historyOpen)}>
              {`Search History (${historyItems.length})`}
            </Button>
          </ClickAwayListener>
        </span>
      </Tooltip>

      <Popper disablePortal={true} container={anchorEl} open={historyOpen} anchorEl={anchorEl} placement="left-start">
        <Paper classes={{ root: classes.popperRoot }}>
          <List dense>
            {historyItems.map((item: any) => {
              return (
                <ListItem button onClick={item.onClick} key={item.label}>
                  <ListItemText>
                    <div className={classes.spacedOut}>
                      <div className={classes.ellipsisText}>{item.label}</div>
                      <div className={classes.labelSecondary}>{item.labelSecondary}</div>
                    </div>
                  </ListItemText>
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Popper>
    </div>
  );
};

const NoSearchesComp = ({ classes }: any) => {
  return (
    <div className={classes.noSearches}>
      <Typography variant="h5">You have no simple searches</Typography>
      <Typography variant="subtitle1">Try to run a simple search from the search box</Typography>
    </div>
  );
};

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

const SearchesComp = ({ searchResult, searchError }: ISearchesComp) => {
  const classes = useStyles();

  if (searchError) {
    return <SearchErrorComp {...searchError} classes={classes} />;
  }

  if (!searchResult) {
    return <NoSearchesComp classes={classes} />;
  }

  const { isLoading, title, subTitle, resultTable, warningText, onAddSelectedObjects, objectTypeFilter } = searchResult;

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div>
          <div className={classes.titleContainer}>
            <Typography variant="h6">{title}</Typography>
            {isLoading && <CircularProgress className={classes.progress} size={20} />}
          </div>
          <Typography variant="body1">{subTitle}</Typography>
          {warningText && (
            <div className={classes.warningContainer}>
              <WarnIcon color="secondary" />
              <Typography variant="subtitle1">{warningText}</Typography>
            </div>
          )}
          {!isLoading && (
            <div className={classes.objectTypeFilter}>
              <MultiSelect {...objectTypeFilter} />
            </div>
          )}
        </div>
        <HistoryComp historyItems={searchResult.historyItems} />
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

interface ISearchError {
  title: string;
  subTitle: string;
  onRetryClick: () => void;
}

interface SearchHistoryItem {
  label: string;
  labelSecondary: string;
  onClick: () => void;
}

interface ISearchesComp {
  searchError?: ISearchError;
  searchResult?: {
    title: string;
    subTitle: string;
    isLoading: boolean;
    warningText?: string;
    onAddSelectedObjects: () => void;
    historyItems: Array<SearchHistoryItem>;
    objectTypeFilter: IMultiSelect;
    resultTable: IObjectTableComp;
  };
}
export default observer(SearchesComp);
