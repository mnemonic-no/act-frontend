import React from 'react';
import { observer } from 'mobx-react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import { assertNever } from '../util/util';
import { LoadingStatus, TLoadable } from '../core/types';

function LoadableComp<R>(props: ILoadableComp<R>) {
  switch (props.loadable.status) {
    case LoadingStatus.PENDING:
      if (!props.loadingComp) {
        return <LoadingComp text="Loading" />;
      }
      return props.loadingComp();
    case LoadingStatus.REJECTED:
      if (!props.errorComp) {
        return <ErrorComp error={props.loadable.error} />;
      }
      return props.errorComp(props.loadable.error);
    case LoadingStatus.DONE:
      return props.resultComp(props.loadable.result);
    default:
      // eslint-disable-next-line
      assertNever(props.loadable);
  }
}

export const ErrorComp = (props: { error: string }) => {
  return <Typography color="error">Error: {props.error}</Typography>;
};

export const LoadingComp = (props: { text: string }) => {
  return (
    <div>
      <Typography display="inline" variant="subtitle1" style={{ paddingRight: '10px' }}>
        {props.text}
      </Typography>
      <CircularProgress size={20} />
    </div>
  );
};

export interface ILoadableComp<R> {
  loadable: TLoadable<R>;
  loadingComp?: () => React.ReactNode;
  errorComp?: (error: string) => any;
  resultComp: (result: R) => any;
}

export default observer(LoadableComp);
