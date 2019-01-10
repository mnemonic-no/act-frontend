import React from 'react';
import PropTypes from 'prop-types';
import wrapDisplayName from 'recompose/wrapDisplayName';
import Immutable from 'seamless-immutable';

/**
 * State:
 * {
 *   isPristine: true,
 *   fields: {
 *     age: 24,
 *   }
 * }
 */
const Deformed = Fields => Component => {
  if (!Fields) throw new Error(`Fields must be supplied, cannot be ${Fields}`);

  class Deformed extends React.Component {
    constructor (props) {
      super(props);

      this.initialFields = Object.keys(this.props.initialFields || {}).reduce(
        (acc, x) => {
          if (Fields.hasOwnProperty(x)) {
            return Object.assign({}, acc, { [x]: this.props.initialFields[x] });
          } else {
            return acc;
          }
        },
        {}
      );
      this.initialFields = Immutable(
        Object.assign({}, Fields, this.initialFields)
      );
      this.state = {
        isPristine: true,
        fields: this.initialFields
      };

      // Assert that all initialFields is present in Fields
      // TODO
    }

    /**
     * onChange updates a given field to a new value
     * @param field The field to update
     * @param value The value to update it too
     * @throws Error if field not in the form fields record
     */
    onChange = (field, value) => {
      // assertHasField(field, this.state.fields);
      this.setState(
        prevState => ({
          isPristine: false,
          fields: prevState.fields.set(field, value)
        }),
        () => this.props.onChange(this.state.fields)
      );
    };

    /**
     * onSetFields updates all the fields
     */
    onSetFields = fields => {
      // TODO: assertFields
      this.setState(prevState => {
        const newFields = Object.assign({}, this.state.fields, fields);
        const isPristine = newFields === this.state.fields;
        return {
          isPristine,
          fields: newFields
        };
      });
    };

    /**
     * onClear clears the form to it's pristine/initial state
     */
    onClear = () => {
      this.setState(
        () => ({
          isPristine: true,
          fields: this.initialFields
        }),
        this.props.onClear(this.initialFields)
      );
    };

    /**
     * onSubmit calls the provided onSubmit function with the current form fields
     */
    onSubmit = () => {
      this.props.onSubmit(this.state.fields);
    };

    render () {
      return (
        <Component
          {...this.props}
          {...this.state}
          onSubmit={this.onSubmit}
          onChange={this.onChange}
          onClear={this.onClear}
          onSetFields={this.onSetFields}
        />
      );
    }
  }
  Deformed.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onClear: PropTypes.func,
    onChange: PropTypes.func,
    initialFields: PropTypes.object
  };
  Deformed.defaultProps = {
    onChange: () => {},
    onClear: () => {},
    initialFields: {}
  };

  Deformed.className = wrapDisplayName(Component, 'deformed');
  return Deformed;
};

export default Deformed;
