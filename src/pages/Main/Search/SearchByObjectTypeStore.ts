import MainPageStore from '../MainPageStore';
import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { byTypeThenValue, objectTypeToColor } from '../../../util/util';
import { getObjectLabelFromFact } from '../../../core/domain';
import { isDone, isPending, NamedId, PredefinedObjectQuery, Search, TConfig } from '../../../core/types';

const byName = (a: { name: string }, b: { name: string }) => (a.name > b.name ? 1 : -1);

const predefinedObjectQueriesFor = (objectTypeName: string, predefinedObjectQueries: Array<PredefinedObjectQuery>) => {
  if (!objectTypeName) return [];

  return predefinedObjectQueries.filter(x => x.objects.find(otName => otName === objectTypeName)).sort(byName);
};

export const toSearchString = (s: string) => {
  return s.trim() + '' + (s.endsWith('*') ? '' : '*');
};

export const suggestions = (
  inputValue: string,
  objectTypeName: string,
  predefinedObjectQueries: Array<PredefinedObjectQuery>
) => {
  const queriesForObjectType = predefinedObjectQueriesFor(objectTypeName, predefinedObjectQueries);
  const trimmedInputValue = inputValue.trim().toLowerCase();

  if (trimmedInputValue.length === 0) return queriesForObjectType;

  if (!queriesForObjectType || queriesForObjectType.length === 0 || trimmedInputValue.length === 0) {
    return [];
  }

  return queriesForObjectType.filter(
    x => x.name.toLowerCase().slice(0, trimmedInputValue.length) === trimmedInputValue
  );
};

const ANY = 'Any';

const toSearch = (args: { objectType: string; objectValue: string; query: string }): Search => {
  if (args.query.length === 0) {
    return { objectType: args.objectType, objectValue: args.objectValue, kind: 'objectFacts' };
  }
  return { ...args, kind: 'objectTraverse' };
};

class SearchByObjectTypeStore {
  root: MainPageStore;
  config: TConfig;
  @observable objectType: string = '';
  @observable objectValue: string = '';
  @observable query: string = '';

  suggestionLimit = 20;

  predefinedObjectQueries: Array<PredefinedObjectQuery>;

  constructor(root: MainPageStore, config: TConfig) {
    this.root = root;
    this.config = config;
    this.predefinedObjectQueries = config.predefinedObjectQueries || [];
  }

  @action
  submitSearch() {
    this.root.backendStore.executeSearch(
      toSearch({
        objectType: this.objectType,
        objectValue: this.objectValue,
        query: this.query
      })
    );
  }

  @action.bound
  onClear() {
    this.query = '';
    this.objectValue = '';
  }

  @action.bound
  onQueryInputChange(newValue: string) {
    this.query = newValue;
  }

  @computed
  get queryInput() {
    return {
      value: this.query,
      onChange: this.onQueryInputChange,
      suggestions: suggestions(this.query, this.objectType, this.predefinedObjectQueries).map(
        (x: PredefinedObjectQuery) => ({
          ...x,
          uiText: x.name,
          toolTip: x.description
        })
      )
    };
  }

  @action.bound
  onObjectTypeChange(value: string) {
    this.objectType = value;
  }

  @action.bound
  onObjectValueChange(value: string) {
    this.objectValue = value ? value : '';

    if (this.objectValue.length >= 2) {
      this.root.backendStore.autoCompleteSimpleSearchBackendStore.execute({
        searchString: toSearchString(this.objectValue),
        objectTypeFilter: this.objectType && this.objectType !== ANY ? [this.objectType] : []
      });
    }
  }

  @computed
  get objectTypeSelector() {
    if (!this.root.backendStore.actObjectTypes) {
      throw new Error('Failed to initialize actObjectTypes');
    }

    return {
      loadable: this.root.backendStore.actObjectTypes,
      value: this.objectType,
      objectTypes: isDone(this.root.backendStore.actObjectTypes)
        ? _.sortBy((x: NamedId) => x.name)(
            this.root.backendStore.actObjectTypes.result.objectTypes.slice().concat([{ id: 'any', name: ANY }])
          )
        : [],
      onChange: this.onObjectTypeChange
    };
  }

  @computed
  get autoSuggester() {
    const simpleSearch = this.root.backendStore.autoCompleteSimpleSearchBackendStore.getSimpleSearch(
      toSearchString(this.objectValue),
      this.objectType !== ANY ? [this.objectType] : []
    );

    return {
      objectTypes: this.root.backendStore.actObjectTypes,
      isLoading: isPending(simpleSearch),
      suggestions: isDone(simpleSearch)
        ? simpleSearch.result.objects
            .slice() // Don't mutate the underlying array
            .sort(byTypeThenValue)
            .map(actObject => ({
              actObject: actObject,
              color: objectTypeToColor(this.config.objectColors || {}, actObject.type.name),
              objectLabel:
                getObjectLabelFromFact(actObject, this.config.objectLabelFromFactType, simpleSearch.result.facts) ||
                actObject.value
            }))
            .slice(0, this.suggestionLimit)
        : [],
      onChange: this.onObjectValueChange,
      onSuggestionSelected: (s: any) => {
        this.objectType = s.actObject.type.name;
        this.objectValue = s.actObject.value;
      },
      value: this.objectValue,
      label: 'Object value'
    };
  }

  @computed
  get isReadyToSearch() {
    return this.objectType.length > 0 && this.objectType !== ANY;
  }
}

export default SearchByObjectTypeStore;
