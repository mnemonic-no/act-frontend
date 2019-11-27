import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';

import ObjectSummaryPageStore from './ObjectSummaryPageStore';
import ObjectTitle from '../../components/ObjectTitle';
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
  header: {
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
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

const SummaryPageComp = ({ store }: ISummaryPageComp) => {
  const classes = useStyles();

  const content = store.prepared.content;

  return (
    <Page errorSnackbar={store.prepared.error} isLoading={false} leftMenuItems={store.prepared.pageMenu}>
      {!content && <h1>Empty page</h1>}
      {content && (
        <div className={classes.root}>
          <Paper className={classes.header}>
            <ObjectTitle {...content.title} />
            <Tooltip title={content.addToGraphButton.tooltip}>
              <Button variant="outlined" onClick={content.addToGraphButton.onClick}>
                {content.addToGraphButton.text}
              </Button>
            </Tooltip>
          </Paper>
          <div className={classes.sections}>
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
