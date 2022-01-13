import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import ActIcon from './ActIcon';
import TitledButtonListComp, { ITitledButtonListProps } from './TitledButtonList';

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1)
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row-reverse'
  },
  section: {
    padding: theme.spacing(3, 0)
  },
  breakWords: {
    wordBreak: 'break-all'
  }
}));

const GraphQueryDialogComp = (props: IGraphQueryDialogComp) => {
  const classes = useStyles();

  return (
    <Dialog open={props.isOpen} onClose={props.onClose} maxWidth="sm" fullWidth>
      <form
        onSubmit={e => {
          e.preventDefault();
          props.onSubmit();
        }}>
        <DialogTitle>
          Graph query
          <IconButton className={classes.closeButton} aria-label="close" onClick={props.onClose}>
            <ActIcon iconId={'close'} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" style={{ color: props.description.color }} className={classes.breakWords}>
            {props.description.text}
          </Typography>

          {props.predefinedObjectQueryButtonList && (
            <div className={classes.section}>
              <TitledButtonListComp
                title={props.predefinedObjectQueryButtonList.title}
                buttons={props.predefinedObjectQueryButtonList.buttons}
              />
            </div>
          )}

          <Typography variant="body1" gutterBottom>
            Custom query
          </Typography>

          <TextField
            label={'Graph Query'}
            multiline
            autoFocus
            minRows="4"
            variant="outlined"
            rowsMax="10"
            fullWidth
            value={props.graphQuery.value}
            onChange={e => props.graphQuery.onChange(e.target.value)}
          />

          <div className={classes.buttonContainer}>
            <Button type="submit" disabled={!Boolean(props.graphQuery.value)}>
              Search
            </Button>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export interface IGraphQueryDialogComp {
  isOpen: boolean;
  description: { text: string; color: string };
  predefinedObjectQueryButtonList?: ITitledButtonListProps;
  graphQuery: { value: string; onChange: (v: string) => void };
  onClose: () => void;
  onSubmit: () => void;
}

export default GraphQueryDialogComp;
