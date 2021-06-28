import React, { useState } from 'react';
import cc from 'clsx';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ButtonBase from '@material-ui/core/ButtonBase';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  root: { zIndex: 2000 },
  popperRoot: {
    zIndex: 2000,
    maxWidth: '350px',
    minWidth: '300px',
    paddingTop: theme.spacing(2)
  },
  button: {
    padding: theme.spacing(0.5) + 'px ' + theme.spacing(1) + 'px',
    border: '1px solid ' + theme.palette.grey[400],
    borderRadius: theme.spacing(1),
    textAlign: 'left'
  },
  buttonWithoutSelection: {},
  buttonWithSelection: { backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText },

  autoCompletePopper: {
    height: '50px'
  }
}));

const SingleValueFilterComp = (props: ISingleValueFilterComp) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { caption, subTitle } = props.selection
    ? { caption: props.title, subTitle: props.selection }
    : { caption: 'Filter by', subTitle: props.title };

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div
        className={classes.root}
        ref={node => {
          setAnchorEl(node);
        }}>
        <div>
          <ButtonBase
            focusRipple
            onClick={() => setIsOpen(!isOpen)}
            className={cc(classes.button, { [classes.buttonWithSelection]: props.selection })}>
            <div>
              <Typography variant="caption">{caption}</Typography>
              <Typography variant="subtitle1">{subTitle}</Typography>
            </div>
          </ButtonBase>
          {props.selection && (
            <IconButton onClick={props.onClear}>
              <CloseIcon />
            </IconButton>
          )}
        </div>

        <Popper open={isOpen} anchorEl={anchorEl} placement="bottom-start">
          <Paper classes={{ root: classes.popperRoot }}>
            <Autocomplete
              autoHighlight
              autoSelect
              options={props.options}
              getOptionLabel={option => option.text}
              classes={{ popper: classes.autoCompletePopper }}
              onChange={(e: any, v: any) => {
                props.onChange(v);
                setIsOpen(false);
              }}
              renderInput={params => {
                return <TextField {...params} label={props.title} variant="outlined" fullWidth autoFocus />;
              }}
            />
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export interface ISingleValueFilterComp {
  title: string;
  selection: string;
  onChange: (item: { text: string }) => void;
  options: Array<{ text: string }>;
  onClear: () => void;
}

export default SingleValueFilterComp;
