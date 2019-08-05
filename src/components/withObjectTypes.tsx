import React from 'react';
import Typography from '@material-ui/core/Typography';

import actWretch from '../util/actWretch';
import withDataLoader from '../util/withDataLoader';
import memoizeDataLoader from '../util/memoizeDataLoader';

const dataLoader = () =>
  actWretch
    .url('/v1/objectType')
    .get()
    .json(({ data }) => ({
      data: data.slice().sort((a: any, b: any) => {
        return a.name > b.name ? 1 : -1;
      })
    }))
    .catch(error => {
      throw error;
    });

const memoizedDataLoader = memoizeDataLoader(dataLoader);

export default () =>
  withDataLoader(memoizedDataLoader, {
    LoadingComponent: () => <Typography>Loading</Typography>,
    ErrorComponent: () => <Typography>Error loading required data</Typography>
  });
