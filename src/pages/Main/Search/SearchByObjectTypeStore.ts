import MainPageStore from '../MainPageStore';
import { action, computed, observable } from 'mobx';
import * as _ from 'lodash/fp';

import { byTypeThenValue } from '../../../util/util';
import { getObjectLabelFromFact } from '../../../core/domain';
import config from '../../../config';
import { isDone, isPending, NamedId, PredefinedObjectQuery } from '../../../core/types';

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

class SearchByObjectTypeStore {
  root: MainPageStore;
  @observable objectType: string = '';
  @observable objectValue: string = '';
  @observable query: string = '';

  suggestionLimit = 20;

  predefinedObjectQueries: Array<PredefinedObjectQuery>;

  constructor(root: MainPageStore, config: any) {
    this.root = root;
    this.predefinedObjectQueries = config.predefinedObjectQueries || [];
  }

  @action
  submitSearch() {
    const { objectType, objectValue, query } = this;
    this.root.backendStore.executeSearch({ objectType: objectType, objectValue: objectValue, query: query });
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
              objectLabel:
                getObjectLabelFromFact(actObject, config.objectLabelFromFactType, simpleSearch.result.facts) ||
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
