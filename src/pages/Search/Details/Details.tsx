import React from 'react';
import { observer } from 'mobx-react';
import cc from 'clsx';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import ObjectTitle, { IObjectTitleComp } from '../../../components/ObjectTitle';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flex: '1 0 auto',
    padding: '10px'
  }
}));

const useEmptyStyles = makeStyles(() => ({
  centered: {
    display: 'flex',
    textAlign: 'center',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

const useSingleObjectStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'space-between'
  },
  footer: {
    padding: '10px 0'
  }
}));

const useMultiObjectStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'space-between'
  },
  footer: {
    padding: '10px 0'
  }
}));

const EmptyComp = () => {
  const classes = useStyles();
  const emptyClasses = useEmptyStyles();

  return (
    <div className={cc(classes.root, emptyClasses.centered)}>
      <div>
        <Typography variant="h5">Nothing selected</Typography>
        <Typography variant="subtitle1">Select one or more objects in the results table</Typography>
      </div>
    </div>
  );
};

const useHeaderStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}));

const Header = ({ title, clearButton }: any) => {
  const headerClass = useHeaderStyles();

  return (
    <div className={headerClass.root}>
      <Typography variant="h6">{title}</Typography>
      <Tooltip title="Clear selection">
        <Button size="small" variant="outlined" onClick={clearButton.onClick}>
          {clearButton.text}
        </Button>
      </Tooltip>
    </div>
  );
};

const useButtonStyles = makeStyles(() => ({
  buttonList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gridGap: '4px'
  }
}));

const ButtonList = ({ actions }: { actions: Array<IButton> }) => {
  const classes = useButtonStyles();

  return (
    <div className={classes.buttonList}>
      {actions.map(action => {
        return (
          <Tooltip key={action.text} title={action.tooltip}>
            <Button size="small" color="secondary" variant="contained" onClick={action.onClick}>
              {action.text}
            </Button>
          </Tooltip>
        );
      })}
    </div>
  );
};

const SingleObjectComp = ({ title, objectTitle, clearSelectionButton, actions }: ISingleObjectComp) => {
  const classes = useStyles();
  const singleClasses = useSingleObjectStyles();

  return (
    <div className={cc(classes.root, singleClasses.root)}>
      <div>
        <Header title={title} clearButton={clearSelectionButton} />
        <ObjectTitle {...objectTitle} />
      </div>
      <div className={singleClasses.footer}>
        <Typography variant="subtitle1" gutterBottom>
          Actions
        </Typography>

        <ButtonList actions={actions} />
      </div>
    </div>
  );
};

const MultipleObjectsComp = ({ title, subTitle, clearSelectionButton, actions }: IMultipleObjectsComp) => {
  const classes = useStyles();
  const multiClasses = useMultiObjectStyles();

  return (
    <div className={cc(classes.root, multiClasses.root)}>
      <div>
        <Header title={title} clearButton={clearSelectionButton} />
        <Typography variant="subtitle1">{subTitle}</Typography>
      </div>
      <div className={multiClasses.footer}>
        <Typography variant="subtitle1" gutterBottom>
          Actions
        </Typography>

        <ButtonList actions={actions} />
      </div>
    </div>
  );
};

const DetailsComp = ({ content, kind }: IDetailsComp) => {
  switch (kind) {
    case 'empty':
      return <EmptyComp />;
    case 'object':
      return <SingleObjectComp {...(content as ISingleObjectComp)} />;
    case 'objects':
      return <MultipleObjectsComp {...(content as IMultipleObjectsComp)} />;
    default:
      return null;
  }
};

export interface IButton {
  text: string;
  onClick: () => void;
  tooltip: string;
}

export interface ISingleObjectComp {
  title: string;
  objectTitle: IObjectTitleComp;
  clearSelectionButton: IButton;
  actions: Array<IButton>;
}

export interface IMultipleObjectsComp {
  title: string;
  subTitle: string;
  clearSelectionButton: IButton;
  actions: Array<IButton>;
}

export interface IDetailsComp {
  kind: 'empty' | 'object' | 'objects';
  content?: ISingleObjectComp | IMultipleObjectsComp;
}

export default observer(DetailsComp);
