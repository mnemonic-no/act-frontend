import MainPageStore from '../MainPageStore';
import { action, computed, observable } from 'mobx';
import { PredefinedObjectQuery } from '../Details/DetailsStore';

const byName = (a: { name: string }, b: { name: string }) => (a.name > b.name ? 1 : -1);

const predefinedObjectQueriesFor = (objectTypeName: string, predefinedObjectQueries: Array<PredefinedObjectQuery>) => {
  if (!objectTypeName) return [];

  return predefinedObjectQueries.filter(x => x.objects.find(otName => otName === objectTypeName)).sort(byName);
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

class SearchByObjectTypeStore {
  root: MainPageStore;
  @observable objectType: string = '';
  @observable objectValue: string = '';
  @observable query: string = '';

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
      suggestions: suggestions(this.query, this.objectType, this.predefinedObjectQueries).map((x: any) => ({
        ...x,
        uiText: x.name
      }))
    };
  }
}

export default SearchByObjectTypeStore;
