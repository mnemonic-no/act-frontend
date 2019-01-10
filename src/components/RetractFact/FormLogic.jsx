import { compose, withHandlers, withState, withPropsOnChange } from 'recompose';
import { addMessage } from '../../util/SnackbarProvider';

import actWretch from '../../util/actWretch';
import deformed from '../../util/deformed';
import dataState, { Data } from '../../state/data';
import CreateFactFormComp from './Form';

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
}) => fields => {
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
      dataState.addNode({
        data: new Data({ factsData: [data] }),
        search: { createFact: true, factType: data.type.name }
      });

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
  withPropsOnChange([], ({ fact }) => ({
    initialFields: {
      accessMode: fact.accessMode
    }
  })),
  deformed(Fields)
)(CreateFactFormComp);
