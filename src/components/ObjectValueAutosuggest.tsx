import React from 'react';
import { compose, withHandlers, withState, lifecycle, branch } from 'recompose';
import Autosuggest, { ChangeEvent } from 'react-autosuggest';
// @ts-ignore
import match from 'autosuggest-highlight/match';
// @ts-ignore
import parse from 'autosuggest-highlight/parse';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Theme, makeStyles } from '@material-ui/core';

import actWretch from '../util/actWretch';
import withDataLoader from '../util/withDataLoader';
import memoizeDataLoader from '../util/memoizeDataLoader';

const renderInput = ({ classes, label, required, autoFocus, fullWidth, value, ref, ...other }: any) => (
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

const renderSuggestion = (suggestion: any, { query, isHighlighted }: any) => {
  const matches = match(suggestion.value, query);
  const parts = parse(suggestion.value, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part: any, index: number) => (
          <span key={index} style={{ fontWeight: part.highlight ? 500 : 300 }}>
            {part.text}
          </span>
        ))}
      </div>
    </MenuItem>
  );
};

const renderSuggestionsContainer = ({ containerProps, children }: any) => (
  <Paper {...containerProps} square>
    {children}
  </Paper>
);

const useStyles = makeStyles((theme: Theme) => ({
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
    color: theme.palette.common.black
  }
}));

const getSuggestionValue = (suggestion: any) => {
  return suggestion.value;
};

const ObjectValueAutosuggestComp = ({
  value,
  onChangeInternal,
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
}: IObjectValueAutosuggestComp) => {
  const classes = useStyles();

  return (
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
      // @ts-ignore
      ref={x => inputRef && x && inputRef(x.input)}
      inputProps={{
        required,
        autoFocus,
        fullWidth,
        label,
        placeholder,
        classes,
        value,
        onChange: onChangeInternal,
        endAdornment: (
          <>
            {isLoading && (
              <InputAdornment position="end">
                <CircularProgress classes={{ root: classes.progress }} size={20} />
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
};

const objectValuesDataLoader = ({ objectType }: { objectType: string }) =>
  actWretch
    .url(`/v1/object/search`)
    .json({
      objectType: [objectType],
      limit: 20000
    })
    .post()
    .json(({ data }) => ({ objectValues: data }));

const memoizedObjectValuesDataLoader = memoizeDataLoader(objectValuesDataLoader, ['objectType']);

interface IObjectValueAutosuggestComp {
  value: any;
  objectType: any;
  onChangeInternal: (event: React.FormEvent<any>, params: ChangeEvent) => void;
  onChange: (value: string) => void;
  suggestions: any;
  onClearSuggestions: () => void;
  onSuggestionsFetchRequested: () => void;
  required: boolean;
  autoFocus: any;
  fullWidth: any;
  label: string;
  placeholder?: string;
  isLoading: any;
  inputRef: any;
}

export default compose<
  IObjectValueAutosuggestComp,
  Omit<
    IObjectValueAutosuggestComp,
    | 'suggestions'
    | 'setSuggestions'
    | 'onSuggestionsFetchRequested'
    | 'onClearSuggestions'
    | 'onChangeInternal'
    | 'isLoading'
    | 'inputRef'
  >
>(
  branch(
    // TODO: Do we want to whitelist?
    ({ objectType }: { objectType: string }) => Boolean(objectType),
    withDataLoader(memoizedObjectValuesDataLoader, {
      watchProps: []
    })
  ),
  withState('suggestions', 'setSuggestions', []),
  withHandlers({
    onChangeInternal: ({ onChange }: any) => (event: any, { newValue }: any) => onChange(newValue),
    onClearSuggestions: ({ setSuggestions }: any) => () => setSuggestions([]),
    onSuggestionsFetchRequested: ({ setSuggestions, objectValues }: any) => ({ value }: any) => {
      const inputValue = value.trim().toLowerCase();
      const inputLength = inputValue.length;

      if (!objectValues || objectValues.length === 0 || inputLength === 0) {
        return [];
      }
      let count = 0;
      const suggestions = objectValues.filter((x: any) => {
        const keep = count < 5 && x.value.toLowerCase().slice(0, inputLength) === inputValue;
        if (keep) {
          count += 1;
        }
        return keep;
      });

      setSuggestions(suggestions);
    }
  }),
  lifecycle({
    UNSAFE_componentWillReceiveProps(nextProps: any) {
      if (this.props.objectType !== '' && nextProps.objectType !== this.props.objectType) {
        // ObjectType has been changed, refetch suggestions
        this.props.onClearSuggestions();
        if (this.props.onClear && this.props.forceFetch) {
          this.props.onClear();
          this.props.forceFetch();
        }
      } else if (nextProps.objectValues !== this.props.objectValues) {
        // Suggestions has been refetched, update suggestions
        // .? maybe not do anything?
      }
    }
  })
)(ObjectValueAutosuggestComp);
