import { action, computed, observable, runInAction } from 'mobx';

import {
  ActObjectRef,
  FactType,
  isDone,
  isPending,
  NamedId,
  SearchResult,
  SingleFactSearch,
  TConfig
} from '../../core/types';
import { createFact } from '../../core/dataLoaders';
import {
  factMapToObjectMap,
  factTypeString,
  getObjectLabelFromFact,
  isRelevantFactType,
  validBidirectionalFactTargetObjectTypes,
  validUnidirectionalFactTargetObjectTypes
} from '../../core/domain';
import { toSearchString } from '../../pages/Main/Search/SearchByObjectTypeStore';
import BackendStore from '../../backend/BackendStore';
import { byTypeThenValue, objectTypeToColor } from '../../util/util';
import { SimpleSearch } from '../../backend/SimpleSearchBackendStore';

type FactTypeCategory = 'oneLegged' | 'uniDirectional' | 'biDirectional' | null;

type AccessMode = 'Public' | 'RoleBased' | 'Explicit';

type FormCommon = { type: string; accessMode: string; comment?: string };

export type FormUniDirectional = {
  inputValue: string;
  isSelectionSource: boolean;
  otherObject: ActObjectRef;
  validOtherObjectTypes: Array<NamedId>;
};

export type FormBiDirectional = {
  inputValue: string;
  otherObject: ActObjectRef;
  validOtherObjectTypes: Array<NamedId>;
};

/* Can't use id property as some objects may not be exist yet */
const identifier = (actObject: ActObjectRef) => {
  return `${actObject.typeName}/${actObject.value}`;
};

export const createBidirectionalFactRequest = (
  form: FormBiDirectional,
  common: FormCommon,
  selectedObject: ActObjectRef
) => {
  return {
    ...common,
    bidirectionalBinding: true,
    sourceObject: identifier(selectedObject),
    destinationObject: identifier(form.otherObject),
    value: '' // API requires a value
  };
};

export const createUnidirectionalFactRequest = (
  form: FormUniDirectional,
  common: FormCommon,
  selectedObject: ActObjectRef
) => {
  const sourceObject = form.isSelectionSource ? selectedObject : form.otherObject;
  const destinationObject = form.isSelectionSource ? form.otherObject : selectedObject;

  return {
    ...common,
    sourceObject: identifier(sourceObject),
    destinationObject: identifier(destinationObject),
    value: '' // API requires a value
  };
};

export const createOneLeggedFactRequest = (
  form: { value: 'string' },
  common: FormCommon,
  selectedObjectRef: ActObjectRef
) => {
  return {
    ...common,
    value: form.value,
    sourceObject: identifier(selectedObjectRef)
  };
};

export const createFactRequest = (
  factType: FactType,
  selectedObjectRef: ActObjectRef,
  formCommon: FormCommon,
  formOneLegged: any,
  formUnidirectional: FormUniDirectional | null,
  formBidirectional: FormBiDirectional | null
) => {
  if (!factType) throw Error('Fact type not set');

  switch (factTypeString(factType)) {
    case 'oneLegged':
      return createOneLeggedFactRequest(formOneLegged, formCommon, selectedObjectRef);
    case 'biDirectional':
      if (!formBidirectional) throw new Error('Bidirectional form not set');
      return createBidirectionalFactRequest(formBidirectional, formCommon, selectedObjectRef);
    case 'uniDirectional':
      if (!formUnidirectional) throw new Error('Unidirectional form not set');
      return createUnidirectionalFactRequest(formUnidirectional, formCommon, selectedObjectRef);
    default:
      throw Error('Fact type category not supported!' + factType);
  }
};


export const objectValueSuggestions = (simpleSearch: SimpleSearch, config: TConfig) => {
  if (!isDone(simpleSearch)) {
    return [];
  }

  return simpleSearch.result.objects
    .slice() // Don't mutate the underlying array
    .sort(byTypeThenValue)
    .map(actObject => ({
      actObject: actObject,
      color: objectTypeToColor(config.objectColors || {}, actObject.type.name),
      objectLabel:
        getObjectLabelFromFact(
          actObject,
          config.objectLabelFromFactType,
          simpleSearch.result.facts
        ) || actObject.value
    }))
    .slice(0, 5);
}

const ANY = 'Any';

class CreateFactForDialog {
  @observable isOpen: boolean = true;
  @observable isSubmitting: boolean = false;
  @observable error: any;

  @observable factTypes: Array<FactType> = [];

  @observable selectedFactTypeName: string | null = null;

  @observable accessMode: AccessMode = 'Public';
  @observable comment: string = '';

  @observable formOneLegged: { value: string } = { value: '' };
  @observable formUniDirectional: FormUniDirectional | null = null;
  @observable formBidirectional: FormBiDirectional | null = null;

  backendStore: BackendStore;
  config: TConfig;
  selectedObject: ActObjectRef;
  onSuccess: (props: { search: SingleFactSearch; result: SearchResult }) => void;

  constructor(
    backendStore: BackendStore,
    config: TConfig,
    selectedObject: ActObjectRef,
    factTypes: Array<FactType>,
    onSuccess: (props: { search: SingleFactSearch; result: SearchResult }) => void
  ) {
    this.backendStore = backendStore;
    this.config = config;
    this.selectedObject = selectedObject;
    this.onSuccess = onSuccess;

    this.factTypes = factTypes
      .filter(ft => isRelevantFactType(ft, selectedObject.typeName))
      .sort((a, b) => (a.name > b.name ? 1 : -1));

    if (this.factTypes[0]) {
      this.onFactTypeChange(this.factTypes[0].name);
    }
  }

  @action.bound
  onSwapClick() {
    if (!this.formUniDirectional) return;

    const newIsSource = this.formUniDirectional ? !this.formUniDirectional.isSelectionSource : true;
    const validOtherObjects = this.currentFactType
      ? validUnidirectionalFactTargetObjectTypes(this.currentFactType, this.selectedObject.typeName, newIsSource)
      : [];

    this.formUniDirectional = {
      inputValue: '',
      isSelectionSource: newIsSource,
      validOtherObjectTypes: validOtherObjects,
      otherObject: { typeName: validOtherObjects[0].name, value: '' }
    };
  }

  @action
  onFactTypeChange(newFactTypeName: string) {
    this.selectedFactTypeName = newFactTypeName;

    const factType = this.factTypes.find(ft => ft.name === newFactTypeName);
    if (!factType) throw Error('Should never happen');

    switch (this.selectedFactTypeCategory) {
      case 'oneLegged':
        this.formOneLegged = { value: '' };
        break;
      case 'biDirectional':
        const validOtherObjectTypes = validBidirectionalFactTargetObjectTypes(factType, this.selectedObject.typeName);
        this.formBidirectional = {
          inputValue: '',
          validOtherObjectTypes: validBidirectionalFactTargetObjectTypes(factType, this.selectedObject.typeName),
          otherObject: { typeName: validOtherObjectTypes[0].name, value: '' }
        };
        break;
      case 'uniDirectional':
        const isSelectionSource =
          validUnidirectionalFactTargetObjectTypes(factType, this.selectedObject.typeName, true).length > 0;

        const validOtherObjects = this.currentFactType
          ? validUnidirectionalFactTargetObjectTypes(
              this.currentFactType,
              this.selectedObject.typeName,
              isSelectionSource
            )
          : [];

        this.formUniDirectional = {
          inputValue: '',
          isSelectionSource: isSelectionSource,
          validOtherObjectTypes: validOtherObjects,
          otherObject: { typeName: validOtherObjects[0].name, value: '' }
        };
        break;
      default:
        break;
    }
  }

  @action.bound
  onAccessModeSelectorChange(value: AccessMode) {
    this.accessMode = value;
  }

  @action.bound
  onCommentChange(value: string) {
    this.comment = value;
  }

  @action.bound
  onFormBidirectionalChange(otherObject: ActObjectRef) {
    if (this.formBidirectional === null) throw Error('Should not happen');
    this.formBidirectional = { ...this.formBidirectional, otherObject: otherObject };
  }

  @action.bound
  onFormUniDirectionalChange(otherObject: ActObjectRef) {
    if (!this.formUniDirectional) return;
    this.formUniDirectional.otherObject = otherObject;
  }

  @action
  async onSubmit() {
    try {
      this.isSubmitting = true;

      if (!this.currentFactType) return;

      const common: any = {
        type: this.currentFactType.name,
        accessMode: this.accessMode
      };

      if (this.comment) {
        common.comment = this.comment;
      }

      const request = createFactRequest(
        this.currentFactType,
        this.selectedObject,
        common,
        this.formOneLegged,
        this.formUniDirectional,
        this.formBidirectional
      );

      const resultFact = await createFact(request);

      this.isOpen = false;

      const search: SingleFactSearch = {
        kind: 'singleFact',
        id: resultFact.id,
        factTypeName: resultFact.type.name
      };
      const facts = { [resultFact.id]: resultFact };

      this.onSuccess({ search: search, result: { facts: facts, objects: factMapToObjectMap(facts) } });
    } catch (err) {
      runInAction(() => {
        this.error = err;
      });
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  }

  @computed
  get canSwap() {
    return (
      this.formUniDirectional &&
      this.currentFactType &&
      validUnidirectionalFactTargetObjectTypes(
        this.currentFactType,
        this.selectedObject.typeName,
        !this.formUniDirectional.isSelectionSource
      ).length > 0
    );
  }

  @action
  onClose() {
    this.isOpen = false;
  }

  @computed
  get currentFactType() {
    return this.factTypes.find(ft => ft.name === this.selectedFactTypeName);
  }

  @computed
  get selectedFactTypeCategory(): FactTypeCategory {
    if (!this.currentFactType) return null;
    return factTypeString(this.currentFactType);
  }

  @computed
  get oneLeggedFact() {
    return {
      selectedObject: this.selectedObject,
      arrowLabel: this.selectedFactTypeName ? this.selectedFactTypeName : '',
      value: this.formOneLegged.value,
      onChange: (value: string) => {
        this.formOneLegged.value = value;
      }
    };
  }

  @action.bound
  searchForObjectType(value: string, objectTypeName: string) {
    const objectTypeFilter =  objectTypeName !== ANY ? [objectTypeName] : []

    if (value.length >= 2) {
      this.backendStore.autoCompleteSimpleSearchBackendStore.execute({
        searchString: toSearchString(value),
        objectTypeFilter: objectTypeFilter
      });
    }
  }

  @action.bound
  onBidirectionalObjectInputValueChange(value: string) {
    if (!this.formBidirectional) return;

    this.formBidirectional.inputValue = value ? value : '';
    this.formBidirectional.otherObject.value = this.formBidirectional.inputValue;
    this.searchForObjectType(this.formBidirectional.inputValue, this.formBidirectional.otherObject.typeName)
  }

  @action.bound
  onUnidirectionalObjectInputValueChange(value: string) {
    if (!this.formUniDirectional) return;

    this.formUniDirectional.inputValue = value ? value: '';
    this.formUniDirectional.otherObject.value = this.formUniDirectional.inputValue;
    this.searchForObjectType(this.formUniDirectional.inputValue, this.formUniDirectional.otherObject.typeName)
  }

  @computed
  get bidirectionalFact() {
    if (!this.formBidirectional) {
      return {
        selectedObject: this.selectedObject,
        arrowLabel: this.selectedFactTypeName ? this.selectedFactTypeName : ''
      };
    }

    const simpleSearch = this.backendStore.autoCompleteSimpleSearchBackendStore.getSimpleSearch(
      toSearchString(this.formBidirectional.inputValue),
      this.formBidirectional.otherObject.typeName !== ANY ? [this.formBidirectional.otherObject.typeName] : []
    );

    return {
      selectedObject: this.selectedObject,
      arrowLabel: this.selectedFactTypeName ? this.selectedFactTypeName : '',
      objectSelection: this.formBidirectional
        ? {
            selectionObject: this.formBidirectional.otherObject,
            validObjectTypes: this.formBidirectional.validOtherObjectTypes,
            title: 'Destination',
            onChange: this.onFormBidirectionalChange,
            objectValueAutosuggest: {
              label: 'Object value',
              placeholder: 'Object value',
              value: this.formBidirectional.inputValue,
              objectTypes: this.backendStore.actObjectTypes,
              isLoading: isPending(simpleSearch),
              suggestions: objectValueSuggestions(simpleSearch, this.config),
              onChange: this.onBidirectionalObjectInputValueChange,
              onSuggestionSelected: (s: any) => {
                if (!this.formBidirectional) return;
                this.formBidirectional.otherObject.value = s.actObject.value;
                this.formBidirectional.inputValue = s.actObject.value;
              }
            }
          }
        : undefined
    };
  }

  @computed
  get unidirectionalFact() {
    if (this.formUniDirectional === null) return null;

    const inputValue = this.formUniDirectional.inputValue ? this.formUniDirectional.inputValue : '';

    const simpleSearch = this.backendStore.autoCompleteSimpleSearchBackendStore.getSimpleSearch(
      toSearchString(inputValue),
      this.formUniDirectional.otherObject.typeName !== ANY ? [this.formUniDirectional.otherObject.typeName] : []
    );

    return {
      selectedObject: this.selectedObject,
      arrowLabel: this.selectedFactTypeName ? this.selectedFactTypeName : '',
      validObjectTypes: this.formUniDirectional ? this.formUniDirectional.validOtherObjectTypes : [],
      isSelectionSource: this.formUniDirectional?.isSelectionSource,
      otherObject: this.formUniDirectional?.otherObject,
      onSwapClick: this.canSwap ? this.onSwapClick : undefined,
      onChange: this.onFormUniDirectionalChange,

      objectValueAutosuggest: {
        label: 'Object value',
        placeholder: 'Object value',
        value: this.formUniDirectional.inputValue,
        objectTypes: this.backendStore.actObjectTypes,
        isLoading: isPending(simpleSearch),
        suggestions: objectValueSuggestions(simpleSearch, this.config),
        onChange: this.onUnidirectionalObjectInputValueChange,
        onSuggestionSelected: (s: any) => {
          if (!this.formUniDirectional) return;
          this.formUniDirectional.otherObject.value = s.actObject.value;
          this.formUniDirectional.inputValue = s.actObject.value;
        }
      }
    }
  }
}

export default CreateFactForDialog;
