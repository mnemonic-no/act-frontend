import { compose, withHandlers, withState, withPropsOnChange } from 'recompose';
import { addMessage } from '../../util/SnackbarProvider';

import actWretch from '../../util/actWretch';
import deformed from '../../util/deformed';
import CreateFactFormComp from './Form';
import { ActFact } from '../../pages/types';

const Fields = {
  comment: '',
  accessMode: 'Public'
};

const onSubmit = ({
  fact,
  setSubmitting,
  setError,
  close,
  onSuccess
}: {
  fact: ActFact;
  setSubmitting: (x: boolean) => void;
  setError: (error: any) => void;
  close: () => void;
  onSuccess: () => void;
}) => (fields: any) => {
  setSubmitting(true);
  actWretch
    .url(`/v1/fact/uuid/${fact.id}/retract`)
    .json({
      comment: fields.comment,
      accessMode: fields.accessMode
    })
    .post()
    .json(({ data }) => {
      setSubmitting(false);
      setError(null);

      // Add node

      onSuccess();

      addMessage('Fact retracted');
      close();
    })
    .catch(error => {
      setSubmitting(false);
      setError(error);
    });
};

export default compose(
  withState('isSubmitting', 'setSubmitting', false),
  withState('error', 'setError', null),
  withHandlers({ onSubmit }),
  withPropsOnChange([], ({ fact }: any) => ({
    initialFields: {
      accessMode: fact.accessMode
    }
  })),
  deformed(Fields)
  // @ts-ignore
)(CreateFactFormComp);
