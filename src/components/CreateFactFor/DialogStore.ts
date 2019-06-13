import {action, computed, observable, runInAction} from "mobx";
import {ActObject, FactType, NamedId} from "../../pages/types";
import {createFact, factTypesDataLoader} from "../../core/dataLoaders";
import {
    factMapToObjectMap,
    factTypeString,
    isRelevantFactType,
    validBidirectionalFactTargetObjectTypes,
    validUnidirectionalFactTargetObjectTypes
} from "../../core/transformers";
import {addMessage} from "../../util/SnackbarProvider";
import QueryHistory from "../../pages/QueryHistory";

type FactTypeCategory = "oneLegged" | "uniDirectional" | "biDirectional" | null

type AccessMode = "Public" | "RoleBased" | "Explicit";

type FormCommon = { type: string, accessMode: string, comment?: string }

export type FormUniDirectional = {
    isSelectionSource: boolean,
    otherObject: { type: NamedId, value: string },
    validOtherObjectTypes: Array<NamedId>
}

export type FormBiDirectional = {
    otherObject: { type: NamedId, value: string },
    validOtherObjectTypes: Array<NamedId>
}

/* Can't use id property as some objects may not be exist yet */
const identifier = (actObject: { type: NamedId, value: string }) => {
    return `${actObject.type.name}/${actObject.value}`
};

export const createBidirectionalFactRequest = (form: FormBiDirectional, common: FormCommon, selectedObject: ActObject) => {
    return {
        ...common,
        bidirectionalBinding: true,
        sourceObject: identifier(selectedObject),
        destinationObject: identifier(form.otherObject),
        value: '', // API requires a value
    };
};

export const createUnidirectionalFactRequest = (form: FormUniDirectional, common: FormCommon, selectedObject: ActObject) => {
    const sourceObject = form.isSelectionSource ? selectedObject : form.otherObject;
    const destinationObject = form.isSelectionSource ? form.otherObject : selectedObject;

    return {
        ...common,
        sourceObject: identifier(sourceObject),
        destinationObject: identifier(destinationObject),
        value: '', // API requires a value
    };
};

export const createOneLeggedFactRequest = (form: { value: "string" }, common: FormCommon, selectedObject: ActObject) => {
    return {
        ...common,
        value: form.value,
        sourceObject: identifier(selectedObject)
    };
};

export const createFactRequest = (factType: FactType,
                                  selectedObject: ActObject,
                                  formCommon: FormCommon,
                                  formOneLegged: any,
                                  formUnidirectional: FormUniDirectional | null,
                                  formBidirectional: FormBiDirectional | null) => {

    if (!factType) throw Error("Fact type not set");

    switch (factTypeString(factType)) {
        case "oneLegged":
            return createOneLeggedFactRequest(formOneLegged, formCommon, selectedObject);
        case "biDirectional":
            if (!formBidirectional) throw new Error("Bidirectional form not set");
            return createBidirectionalFactRequest(formBidirectional, formCommon, selectedObject);
        case "uniDirectional":
            if (!formUnidirectional) throw new Error("Unidirectional form not set");
            return createUnidirectionalFactRequest(formUnidirectional, formCommon, selectedObject);
        default:
            throw Error("Fact type category not supported!" + factType);
    }
};


class CreateFactForDialog {

    @observable isOpen: boolean = true;
    @observable isSubmitting: boolean = false;
    @observable error: any;

    @observable factTypeField: any;
    @observable factTypes: Array<FactType> = [];

    @observable selectedFactTypeName: string | null = null;

    @observable accessMode: AccessMode = "Public";
    @observable comment: string = "";

    @observable formOneLegged: { value: string } = {value: ""};
    @observable formUniDirectional: FormUniDirectional | null = null;
    @observable formBidirectional: FormBiDirectional | null = null;

    selectedObject: ActObject;
    queryHistory: QueryHistory;

    constructor(selectedObject: ActObject, queryHistory: QueryHistory) {
        this.selectedObject = selectedObject;
        this.queryHistory = queryHistory;

        factTypesDataLoader().then((factTypes: Array<FactType>) => {
            runInAction(() => {
                this.factTypes = factTypes
                    .filter((ft) => isRelevantFactType(ft, selectedObject))
                    .sort((a, b) => a.name > b.name ? 1 : -1);

                this.onFactTypeChange(this.factTypes[0].name)
            });
        })
    }


    @action.bound
    onSwapClick() {
        if (!this.formUniDirectional) return;

        const newIsSource = this.formUniDirectional ? !this.formUniDirectional.isSelectionSource : true;
        const validOtherObjects = this.currentFactType ? validUnidirectionalFactTargetObjectTypes(this.currentFactType, this.selectedObject, newIsSource) : [];

        this.formUniDirectional = {
            isSelectionSource: newIsSource,
            validOtherObjectTypes: validOtherObjects,
            otherObject: {type: validOtherObjects[0], value: ""}
        };
    }

    @action
    onFactTypeChange(newFactTypeName: string) {
        this.selectedFactTypeName = newFactTypeName;

        const factType = this.factTypes.find(ft => ft.name === newFactTypeName);
        if (!factType) throw Error("Should never happen");

        switch (this.selectedFactTypeCategory) {
            case "oneLegged":
                this.formOneLegged = {value: ""};
                break;
            case "biDirectional":
                const validOtherObjectTypes = validBidirectionalFactTargetObjectTypes(factType, this.selectedObject);
                this.formBidirectional = {
                    validOtherObjectTypes: validBidirectionalFactTargetObjectTypes(factType, this.selectedObject),
                    otherObject: {type: validOtherObjectTypes[0], value: ""}};
                break;
            case "uniDirectional":
                const isSelectionSource = validUnidirectionalFactTargetObjectTypes(factType, this.selectedObject, true).length > 0;

                const validOtherObjects = this.currentFactType ? validUnidirectionalFactTargetObjectTypes(this.currentFactType, this.selectedObject, isSelectionSource) : [];

                this.formUniDirectional = {
                    isSelectionSource: isSelectionSource,
                    validOtherObjectTypes: validOtherObjects,
                    otherObject: {type: validOtherObjects[0], value: ""}
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
    onFormBidirectionalChange(otherObject: any) {
        if (this.formBidirectional === null) throw Error("Should not happen");

        this.formBidirectional = {...this.formBidirectional, otherObject: otherObject};
    }

    @action.bound
    onFormUniDirectionalChange(otherObject: any) {
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
                accessMode: this.accessMode,
            };

            if (this.comment) {
                common.comment = this.comment
            }

            const request = createFactRequest(
                this.currentFactType,
                this.selectedObject,
                common,
                this.formOneLegged,
                this.formUniDirectional,
                this.formBidirectional);

            const resultFact = await createFact(request);

            this.isOpen = false;

            addMessage('Fact created');

            const search = {id: resultFact.id, factTypeName: resultFact.type.name};

            const facts = {[resultFact.id]: resultFact};

            this.queryHistory.addQuery({
                id: search.id,
                search: search,
                result: {
                    facts: facts,
                    objects: factMapToObjectMap(facts)
                },
            });

        } catch (err) {
            runInAction(() => {
                this.error = err
            })
        } finally {
            runInAction(() => {
                this.isSubmitting = false
            })
        }
    }

    @computed
    get canSwap() {
        return this.formUniDirectional && this.currentFactType &&
            validUnidirectionalFactTargetObjectTypes(
                this.currentFactType,
                this.selectedObject,
                !this.formUniDirectional.isSelectionSource).length > 0
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
}


export default CreateFactForDialog;
