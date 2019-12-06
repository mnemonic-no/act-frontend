import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import WarnIcon from '@material-ui/icons/Warning';

import ObjectSummaryPageStore from './ObjectSummaryPageStore';
import ObjectTitle, { IObjectTitleComp } from '../../components/ObjectTitle';
import Page from '../Page';
import Section from './Section';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flex: '1 0 auto',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey['100'],
    display: 'flex',
    flexFlow: 'column nowrap'
  },
  sections: {
    flex: '1 0 auto',
    display: 'grid',
    gridGap: theme.spacing(1),
    [theme.breakpoints.only('xs')]: {
      gridTemplateColumns: '1fr'
    },
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
    },
    [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))'
    },
    gridTemplateRows: 'repeat(auto-fit, minmax(400px, 1fr))',
    overflowY: 'auto'
  }
}));

const useTitleSectionStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(1),
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch'
  },
  heading: { display: 'flex', justifyContent: 'space-between' },
  content: { flex: '1 0 auto', display: 'flex', flexFlow: 'column nowrap', paddingTop: theme.spacing(1) },
  centered: {
    display: 'flex',
    flexFlow: 'column',
    flex: '1 0 auto',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tag: {
    marginRight: theme.spacing(0.5)
  },
  warningContainer: {
    display: 'flex',
    color: theme.palette.secondary.dark
  }
}));

const TitleSection = (props: {
  isLoading: boolean;
  warning?: string;
  title: IObjectTitleComp;
  addToGraphButton: { tooltip: string; onClick: () => void; text: string };
  categories: Array<string>;
}) => {
  const classes = useTitleSectionStyles();

  return (
    <Paper className={classes.root}>
      <div className={classes.heading}>
        <Typography variant="h6">Object Summary {props.isLoading && <CircularProgress size={20} />}</Typography>

        <Tooltip title={props.addToGraphButton.tooltip}>
          <Button variant="outlined" onClick={props.addToGraphButton.onClick}>
            {props.addToGraphButton.text}
          </Button>
        </Tooltip>
      </div>
      <ObjectTitle {...props.title} />
      <div className={classes.content}>
        <div>
          {props.categories.map((category, idx) => {
            return (
              <Tooltip title={'Category'} key={idx}>
                <Chip className={classes.tag} label={category} size="small" color="primary" />
              </Tooltip>
            );
          })}
        </div>
        {props.warning && (
          <div className={classes.warningContainer}>
            <WarnIcon color="secondary" />
            <Typography variant="subtitle1">{props.warning}</Typography>
          </div>
        )}
      </div>
    </Paper>
  );
};

const SummaryPageComp = ({ store }: ISummaryPageComp) => {
  const classes = useStyles();

  const { content } = store.prepared;

  return (
    <Page errorSnackbar={store.prepared.error} isLoading={false} leftMenuItems={store.prepared.pageMenu}>
      {!content && <h1>Empty page</h1>}
      {content && (
        <div className={classes.root}>
          <div className={classes.sections}>
            <TitleSection {...content.titleSection} />
            {content.sections.map(section => {
              return <Section key={section.title} {...section} />;
            })}
          </div>
        </div>
      )}
    </Page>
  );
};

export interface ISummaryPageComp {
  store: ObjectSummaryPageStore;
}

export default observer(SummaryPageComp);
