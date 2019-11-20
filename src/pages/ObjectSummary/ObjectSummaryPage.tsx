import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import ObjectSummaryPageStore from './ObjectSummaryPageStore';
import ObjectTitle from '../../components/ObjectTitle';
import Page from '../Page';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(1)
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
          <ObjectTitle {...content.title} />
          <Tooltip title={content.addToGraphButton.tooltip}>
            <Button variant="outlined" onClick={content.addToGraphButton.onClick}>
              {content.addToGraphButton.text}
            </Button>
          </Tooltip>
        </div>
      )}
    </Page>
  );
};

export interface ISummaryPageComp {
  store: ObjectSummaryPageStore;
}

export default observer(SummaryPageComp);
