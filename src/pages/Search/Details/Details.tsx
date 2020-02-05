import React from 'react';
import { observer } from 'mobx-react';
import cc from 'clsx';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import GraphQueryDialog, { IGraphQueryDialogComp } from '../../../components/GraphQueryDialog';
import GroupByAccordionComp, { IGroupByAccordionComp } from '../../../components/GroupByAccordion';
import ObjectTitle, { IObjectTitleProps } from '../../../components/ObjectTitle';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: '10px',
    outline: '2px solid pink'
  }
}));

const useEmptyStyles = makeStyles(() => ({
  centered: {
    width: '100%',
    display: 'flex',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

const useSingleObjectStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%'
  },
  footer: {
    padding: '10px 0'
  },
  linkToSummary: {
    paddingBottom: theme.spacing(2)
  }
}));

const useMultiObjectStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    overflow: 'hidden',
    width: '100%',
    flexDirection: 'column'
  },

  accordion: {
    flex: '1 1 auto',
    maxWidth: '500px',
    overflowY: 'auto',
    overflowX: 'hidden',
    height: '0px',
    minHeight: '0px'
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
            <Button size="small" color="secondary" variant="contained" onClick={action.onClick} href={action.href}>
              {action.text}
            </Button>
          </Tooltip>
        );
      })}
    </div>
  );
};

const SingleObjectComp = ({
  title,
  objectTitle,
  clearSelectionButton,
  linkToSummaryPage,
  actions
}: ISingleObjectComp) => {
  const classes = useStyles();
  const singleClasses = useSingleObjectStyles();

  return (
    <div className={cc(classes.root, singleClasses.root)}>
      <div>
        <Header title={title} clearButton={clearSelectionButton} />
        <ObjectTitle {...objectTitle} />
        <div className={singleClasses.linkToSummary}>
          <Link href={linkToSummaryPage.href} color="primary" underline={'always'} onClick={linkToSummaryPage.onClick}>
            {linkToSummaryPage.text}
          </Link>
        </div>
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

const MultipleObjectsComp = (props: IMultipleObjectsComp) => {
  const classes = useStyles();
  const multiClasses = useMultiObjectStyles();

  return (
    <div className={cc(classes.root, multiClasses.root)}>
      <div>
        <Header title={props.title} clearButton={props.clearSelectionButton} />
        <Typography variant="subtitle1">{props.subTitle}</Typography>
      </div>

      <div className={multiClasses.accordion}>
        <GroupByAccordionComp {...props.objectTypeGroupByAccordion} />
      </div>

      <div className={multiClasses.footer}>
        <Typography variant="subtitle1" gutterBottom>
          Actions
        </Typography>

        <ButtonList actions={props.actions} />
      </div>
      <GraphQueryDialog {...props.graphQueryDialog} />
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
  onClick?: (e: any) => void;
  href?: string;
  tooltip: string;
}

export interface ISingleObjectComp {
  title: string;
  linkToSummaryPage: { text: string; tooltip: string; href: string; onClick: (e: any) => void };
  objectTitle: IObjectTitleProps;
  clearSelectionButton: IButton;
  actions: Array<IButton>;
}

export interface IMultipleObjectsComp {
  title: string;
  subTitle: string;
  clearSelectionButton: IButton;
  objectTypeGroupByAccordion: IGroupByAccordionComp;
  actions: Array<IButton>;
  graphQueryDialog: IGraphQueryDialogComp;
}

export interface IDetailsComp {
  kind: 'empty' | 'object' | 'objects';
  content?: ISingleObjectComp | IMultipleObjectsComp;
}

export default observer(DetailsComp);
