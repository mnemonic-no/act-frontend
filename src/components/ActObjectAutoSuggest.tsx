import React, { FormEvent } from 'react';
import { observer } from 'mobx-react';
import { makeStyles, MenuItem, Theme } from '@material-ui/core';
import Autosuggest, { ChangeEvent } from 'react-autosuggest';
import InputAdornment from '@material-ui/core/InputAdornment';
import CircularProgress from '@material-ui/core/CircularProgress';
// @ts-ignore
import parse from 'autosuggest-highlight/parse';
// @ts-ignore
import match from 'autosuggest-highlight/match';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import { objectTypeToColor, renderObjectValue } from '../util/utils';
import { ActObject } from '../pages/types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
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

const renderSuggestion = (
  suggestion: Suggestion,
  { query, isHighlighted }: { query: string; isHighlighted: boolean }
) => {
  const objectType = suggestion.actObject.type.name;
  const objectValue = renderObjectValue(suggestion.actObject, 20);

  const matches = match(objectValue, query);
  const parts = parse(objectValue, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        <span style={{ color: objectTypeToColor(objectType) }}>{objectType + ' '}</span>
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

const renderInput = ({ classes, label, helperText, required, autoFocus, fullWidth, value, ref, ...other }: any) => {
  return (
    <TextField
      {...{ label, required, autoFocus, fullWidth, value }}
      inputRef={ref}
      helperText={helperText}
      InputProps={{ ...other }}
    />
  );
};

const ActObjectAutoSuggest = ({
  value,
  isLoading,
  suggestions,
  label,
  fullWidth,
  required,
  onChange,
  onSuggestionSelected,
  placeholder
}: IActObjectAutoSuggestComp) => {
  const classes = useStyles();

  const onChangeWrapper: (event: FormEvent<any>, params: ChangeEvent) => void = (event, params) => {
    const { newValue, method } = params;
    // Avoid updating the input field when the user is navigating the suggestion list.
    if (method === 'enter' || method === 'type' || method === 'click') {
      event.preventDefault();
      onChange(newValue);
    }
  };

  return (
    <Autosuggest
      theme={{
        container: classes.container,
        suggestionsContainerOpen: classes.suggestionsContainerOpen,
        suggestionsList: classes.suggestionsList,
        suggestion: classes.suggestion
      }}
      inputProps={{
        required,
        autoFocus: true,
        fullWidth,
        label,
        placeholder,
        classes,
        value: value,
        onChange: onChangeWrapper,
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
      shouldRenderSuggestions={() => Boolean(value && value.length > 2)}
      renderInputComponent={renderInput}
      renderSuggestion={renderSuggestion}
      renderSuggestionsContainer={renderSuggestionsContainer}
      onSuggestionSelected={(event, data) => onSuggestionSelected(data.suggestion)}
      onSuggestionsFetchRequested={() => null} // No-op, rerendering handled by mobx
      onSuggestionsClearRequested={() => null} // No-op, rerendering handled by mobx
      getSuggestionValue={(suggestion: any) => suggestion.value}
    />
  );
};

type Suggestion = {
  actObject: ActObject;
  [key: string]: any;
};

export interface IActObjectAutoSuggestComp {
  value: string;
  isLoading: boolean;
  suggestions: Array<Suggestion>;
  onChange: Function;
  onSuggestionSelected: (s: Suggestion) => void;
  required: boolean;
  fullWidth: boolean;
  label: string;
  placeholder: string;
}

export default observer(ActObjectAutoSuggest);
