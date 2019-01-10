import React from 'react';
import {
  compose,
  withProps,
  withPropsOnChange,
  withHandlers,
  withState
} from 'recompose';
import { addMessage } from '../../util//SnackbarProvider';

import withDataLoader from '../../util/withDataLoader';
import CenteredCircularProgress from '../CenteredCircularProgress';
import actWretch from '../../util/actWretch';

import deformed from '../../util/deformed';
import CreateFactFormComp from './Form';
import dataState, { Data } from '../../state/data';
import graphInformation from '../../state/graphInformation';

const Fields = {
  factType: null,
  factValue: '',
  bindings: [],
  comment: '',
  accessMode: 'Public'
};

const factTypesDataloader = ({ initialObject }) =>
  actWretch
    .url(`/v1/factType`)
    .get()

    // Only fact types that allows the initial object
    .json(({ data }) => {
      if (!initialObject) return { data };
      return {
        data: data.filter(
          x =>
            x.relevantObjectBindings &&
            x.relevantObjectBindings.some(
              y =>
                y.sourceObjectType.name === initialObject.type.name ||
                y.destinationObjectType.name === initialObject.type.name
            )
        )
      };
    })
    .then(({ data }) => ({
      factTypes: data
    }));

const getObjectTypes = factType => {
  const objectTypes = factType.relevantObjectBindings.reduce((acc, x) => {
    if (!acc[x.objectType.id]) {
      return {
        ...acc,
        [x.objectType.id]: { ...x.objectType, directions: [x.direction] }
      };
    }
    acc[x.objectType.id].directions.push(x.direction);
    return acc;
  }, {});
  return Object.keys(objectTypes).map(x => objectTypes[x]);
};

const onSubmit = ({ setSubmitting, setError, close }) => fields => {
  setSubmitting(true);
  actWretch
    .url('/v1/fact')
    .json({
      type: fields.factType,
      value: fields.factValue,
      comment: fields.comment,
      accessMode: fields.accessMode,
      bindings: fields.bindings.map(x => ({
        objectType: x.objectType.name,
        objectValue: x.objectValue,
        direction: x.direction
      }))
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
      // Select it
      graphInformation.setSelectedNode({
        id: data.id,
        type: 'fact'
      });

      addMessage('Fact created');
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
  withDataLoader(factTypesDataloader, {
    watchProps: [],
    ErrorComponent: ({ error }) => {
      throw error;
    },
    LoadingComponent: () => (
      <div style={{ height: 400 }}>
        <CenteredCircularProgress />
      </div>
    )
  }),

  withProps(({ factTypes, initialObject }) => {
    let initialBinding;
    if (initialObject) {
      const objectTypes = getObjectTypes(factTypes[0]);
      const objectType = objectTypes.find(
        x => x.name === initialObject.type.name
      );
      initialBinding = {
        objectType,
        objectValue: initialObject.value,
        direction: objectType.directions[0]
      };
    }
    return {
      initialFields: {
        factType: factTypes[0].name,
        bindings: initialBinding ? [initialBinding] : []
      }
    };
  }),
  deformed(Fields),

  // Derive object types from the select fact type
  // TODO Optimize
  withPropsOnChange(
    (props, nextProps) => {
      return (
        props.fields.factType !== nextProps.fields.factType ||
        props.factTypes !== nextProps.factTypes
      );
    },
    ({ fields, factTypes }) => ({
      objectTypes: getObjectTypes(
        factTypes.find(x => x.name === fields.factType)
      )
    })
  )
)(CreateFactFormComp);
