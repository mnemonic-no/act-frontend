import React, { useState } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Button from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
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

const HistoryButtonComp = ({ historyItems }: { historyItems: Array<ISearchHistoryItem> }) => {
  const classes = useStyles();
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

interface ISearchHistoryItem {
  label: string;
  labelSecondary: string;
  onClick: () => void;
}

export default HistoryButtonComp;
