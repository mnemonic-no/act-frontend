import React from 'react'
import PropTypes from 'prop-types'
import {
  compose,
  withHandlers,
  setPropTypes,
  withState,
  lifecycle,
  branch
} from 'recompose'
import Autosuggest from 'react-autosuggest'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import CircularProgress from '@material-ui/core/CircularProgress'

import actWretch from '../util/actWretch'
import withDataLoader from '../util/withDataLoader'
import memoizeDataLoader from '../util/memoizeDataLoader'

const renderInput = ({
  classes,
  label,
  required,
  autoFocus,
  fullWidth,
  value,
  ref,
  ...other
}) => (
  <TextField
    {...{ label, required, autoFocus, fullWidth, value }}
    inputRef={ref}
    InputProps={{
      classes: {
        input: classes.input
      },
      ...other
    }}
  />
);

const renderSuggestion = (suggestion, { query, isHighlighted }) => {
  const matches = match(suggestion.value, query);
  const parts = parse(suggestion.value, matches);

  return (
    <MenuItem selected={isHighlighted} component='div'>
      <div>
        {parts.map((part, index) => (
          <span key={index} style={{fontWeight: part.highlight ? 500 : 300}}>{part.text}</span>
        ))}
      </div>
    </MenuItem>
  )
};

const renderSuggestionsContainer = ({ containerProps, children }) => (
  <Paper {...containerProps} square>
    {children}
  </Paper>
);

const styles = theme => ({
  container: {
    position: 'relative'
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2
  },
  suggestion: {
    display: 'block'
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none'
  },
  progress: {
    color: theme.palette.common.minBlack
  }
});

const getSuggestionValue = suggestion => {
  return suggestion.value
};

const ObjectValueAutosuggestComp = ({
  classes,
  value,
  onChange,
  suggestions,
  onClearSuggestions,
  onSuggestionsFetchRequested,
  required,
  autoFocus,
  fullWidth,
  label,
  placeholder,
  isLoading,
  inputRef
}) => (
  <Autosuggest
    theme={{
      container: classes.container,
      suggestionsContainerOpen: classes.suggestionsContainerOpen,
      suggestionsList: classes.suggestionsList,
      suggestion: classes.suggestion
    }}
    renderInputComponent={renderInput}
    renderSuggestion={renderSuggestion}
    renderSuggestionsContainer={renderSuggestionsContainer}
    ref={x => inputRef && x && inputRef(x.input)}
    inputProps={{
      required,
      autoFocus,
      fullWidth,
      label,
      placeholder,
      classes,
      value,
      onChange,
      endAdornment: (
        <>
          {isLoading && (
            <InputAdornment position='end'>
              <CircularProgress
                classes={{ root: classes.progress }}
                size={20}
              />
            </InputAdornment>
          )}
        </>
      )
    }}
    suggestions={suggestions}
    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
    onSuggestionsClearRequested={onClearSuggestions}
    getSuggestionValue={getSuggestionValue}
  />
);

const objectValuesDataLoader = ({ objectType }) =>
  actWretch
    .url(`/v1/object/search`)
    .json({
      objectType: [objectType],
      limit: 20000
    })
    .post()
    .json(({ data }) => ({ objectValues: data }))

const memoizedObjectValuesDataLoader = memoizeDataLoader(
  objectValuesDataLoader,
  ['objectType']
)

export default compose(
  setPropTypes({
    value: PropTypes.string,
    onChange: PropTypes.func,
    objectType: PropTypes.string,

    required: PropTypes.bool,
    autoFocus: PropTypes.bool,
    fullWidth: PropTypes.bool,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    inputRef: PropTypes.func
  }),
  branch(
    // TODO: Do we want to whitelist?
    ({ objectType }) => Boolean(objectType),
    withDataLoader(memoizedObjectValuesDataLoader, {
      watchProps: []
    })
  ),
  withState('suggestions', 'setSuggestions', []),
  withHandlers({
    onChange: ({ onChange }) => (event, { newValue }) => onChange(newValue),
    onClearSuggestions: ({ setSuggestions }) => () => setSuggestions([]),
    onSuggestionsFetchRequested: ({ setSuggestions, objectValues }) => ({
      value
    }) => {
      const inputValue = value.trim().toLowerCase();
      const inputLength = inputValue.length;

      if (!objectValues || objectValues.length === 0 || inputLength === 0) {
        return []
      }
      let count = 0;
      const suggestions = objectValues.filter(x => {
        const keep =
          count < 5 &&
          x.value.toLowerCase().slice(0, inputLength) === inputValue
        if (keep) {
          count += 1
        }
        return keep
      });

      setSuggestions(suggestions)
    }
  }),
  lifecycle({
    componentWillReceiveProps (nextProps) {
      if (
        this.props.objectType !== '' &&
        nextProps.objectType !== this.props.objectType
      ) {
        // ObjectType has been changed, refetch suggestions
        this.props.onClearSuggestions()
        if (this.props.onClear && this.props.forceFetch) {
          this.props.onClear()
          this.props.forceFetch()
        }
      } else if (nextProps.objectValues !== this.props.objectValues) {
        // Suggestions has been refetched, update suggestions
        // .? maybe not do anything?
      }
    }
  }),
  withStyles(styles)
)(ObjectValueAutosuggestComp)
