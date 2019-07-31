import React, { FormEvent } from 'react';
import Autosuggest, { ChangeEvent } from 'react-autosuggest';
// @ts-ignore
import parse from 'autosuggest-highlight/parse';
// @ts-ignore
import match from 'autosuggest-highlight/match';

import { createStyles, Typography, withStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';

const styles = (theme: any) =>
  createStyles({
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

const renderSuggestion = (
  suggestion: Suggestion,
  { query, isHighlighted }: { query: string; isHighlighted: boolean }
) => {
  const matches = match(suggestion.uiText, query);
  const parts = parse(suggestion.uiText, matches);

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
    {children && (
      <Typography variant="subtitle2" style={{ padding: '4px' }}>
        Predefined queries
      </Typography>
    )}
    {children}
  </Paper>
);

const getSuggestionValue = (suggestion: Suggestion) => {
  return suggestion.query;
};

type Suggestion = {
  uiText: string;
  [key: string]: any;
};

const QueryAutoSuggest = ({
  classes,
  value,
  suggestions,
  required,
  fullWidth,
  label,
  helperText,
  onChange,
  placeholder
}: {
  classes: any;
  value: string;
  suggestions: Array<Suggestion>;
  onChange: Function;
  required: boolean;
  fullWidth: boolean;
  label: string;
  helperText?: string;
  placeholder: string;
}) => {
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
      renderInputComponent={renderInput}
      renderSuggestion={renderSuggestion}
      renderSuggestionsContainer={renderSuggestionsContainer}
      inputProps={{
        required,
        fullWidth,
        label,
        placeholder,
        helperText,
        classes,
        value,
        onChange: onChangeWrapper
      }}
      highlightFirstSuggestion={true}
      suggestions={suggestions}
      shouldRenderSuggestions={() => true} // Override default, show all suggestions with empty input
      onSuggestionsFetchRequested={() => null} // No-op, rerendering handled by mobx
      onSuggestionsClearRequested={() => null} // No-op, rerendering handled by mobx
      getSuggestionValue={getSuggestionValue}
    />
  );
};

// @ts-ignore
export default withStyles(styles)(QueryAutoSuggest);
