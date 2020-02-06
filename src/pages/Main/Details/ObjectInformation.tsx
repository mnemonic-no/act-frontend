import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { ActionButton } from '../../../core/types';
import CenteredCircularProgress from '../../../components/CenteredCircularProgress';
import CreateFactForObjectDialog from '../../../components/CreateFactFor/Dialog';
import CreateFactForDialog from '../../../components/CreateFactFor/DialogStore';
import FactStats, { IFactStatsProps } from '../../../components/FactStats';
import GraphQueryDialogComp, { IGraphQueryDialogComp } from '../../../components/GraphQueryDialog';
import ObjectTitle, { IObjectTitleProps } from '../../../components/ObjectTitle';
import TitledButtonListComp from '../../../components/TitledButtonList';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1),
    paddingBottom: 0,
    height: `calc(100% - ${theme.spacing(3)}px)`
  },
  info: {
    overflowY: 'auto',
    flex: '0 1 auto',
    minHeight: '200px'
  },
  actionContainer: {
    paddingTop: theme.spacing(2)
  },
  spacer: {
    flex: '1 1 auto'
  },
  footer: {
    justifySelf: 'end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(),
    display: 'flex',
    justifyContent: 'space-between'
  },
  linkToSummary: {
    paddingBottom: theme.spacing(2)
  }
}));

const ObjectInformationComp = (props: IObjectInformationProps) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ObjectTitle {...props.objectTitle} />

      <div className={classes.info}>
        <Tooltip title={props.linkToSummaryPage.tooltip}>
          <div className={classes.linkToSummary}>
            <Link
              href={props.linkToSummaryPage.href}
              color="primary"
              underline={'always'}
              onClick={props.linkToSummaryPage.onClick}>
              {props.linkToSummaryPage.text}
            </Link>
          </div>
        </Tooltip>
        {props.isLoadingData && <CenteredCircularProgress />}
        <Typography variant="body1" gutterBottom>
          {props.factTitle}
        </Typography>

        <FactStats {...props.factStats} />
      </div>

      {props.actions.map(({ title, buttons }) => (
        <div key={title} className={classes.actionContainer}>
          <TitledButtonListComp title={title} buttons={buttons} />
        </div>
      ))}
      <div className={classes.spacer} />

      <div className={classes.footer}>
        {props.footerButtons.map(b => (
          <Button key={b.text} onClick={b.onClick}>
            {b.text}
          </Button>
        ))}
      </div>
      {props.createFactDialog && <CreateFactForObjectDialog store={props.createFactDialog} />}
      <GraphQueryDialogComp {...props.graphQueryDialog} />
    </div>
  );
};

export interface IObjectInformationProps {
  id: string;
  objectTitle: IObjectTitleProps;
  isLoadingData: boolean;
  actions: Array<{ title: string; buttons: Array<ActionButton> }>;
  factTitle: string;
  factStats: IFactStatsProps;
  footerButtons: Array<{ text: string; onClick: () => void }>;
  linkToSummaryPage: { text: string; href: string; tooltip: string; onClick: (e: any) => void };
  createFactDialog: CreateFactForDialog;
  graphQueryDialog: IGraphQueryDialogComp;
}

export default observer(ObjectInformationComp);
