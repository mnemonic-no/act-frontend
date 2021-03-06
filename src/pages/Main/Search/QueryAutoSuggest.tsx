import React, { FormEvent } from 'react';
import Autosuggest, { ChangeEvent } from 'react-autosuggest';
// @ts-ignore
import parse from 'autosuggest-highlight/parse';
// @ts-ignore
import match from 'autosuggest-highlight/match';

import { makeStyles, Theme } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

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
    <Tooltip title={suggestion.toolTip}>
      <MenuItem selected={isHighlighted} component="div">
        <div>
          {parts.map((part: any, index: number) => (
            <span key={index} style={{ fontWeight: part.highlight ? 500 : 300 }}>
              {part.text}
            </span>
          ))}
        </div>
      </MenuItem>
    </Tooltip>
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
  toolTip: string;
  [key: string]: any;
};

const QueryAutoSuggest = ({
  value,
  suggestions,
  required,
  fullWidth,
  label,
  helperText,
  onChange,
  placeholder
}: IQueryAutoSuggest) => {
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

interface IQueryAutoSuggest {
  value: string;
  suggestions: Array<Suggestion>;
  onChange: Function;
  required: boolean;
  fullWidth: boolean;
  label: string;
  helperText?: string;
  placeholder: string;
}

export default QueryAutoSuggest;
