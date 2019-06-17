import {createFactRequest} from './DialogStore'
import {actObject, factType} from "../../core/testHelper";


it('can make bi-directional fact requests', () => {

    const biDirectionalFactType = factType({
        name: "alias",
        relevantObjectBindings: [{
            bidirectionalBinding: true,
            sourceObjectType: {id: "x", name: "threatActor"},
            destinationObjectType: {id: "x", name: "threatActor"}
        }]
    });

    const result = createFactRequest(
        biDirectionalFactType,
        actObject({value: "BearSource", type: {id: "x", name: "threatActor"}}),
        {accessMode: "Public", type: "alias"},
        null,
        null,
        {
            validOtherObjectTypes: [{id: "x", name: "threatActor"}],
            otherObject: {value: "BearDestination", type: {id: "x", name: "threatActor"}}
        });

    expect(result).toEqual({
        type: "alias",
        value: "",
        bidirectionalBinding: true,
        sourceObject: "threatActor/BearSource",
        destinationObject: "threatActor/BearDestination",
        accessMode: "Public"
    })

});

it('can make uni-directional fact requests', () => {

    const uniDirectionalFactType = factType({
        name: "attributedTo",
        relevantObjectBindings: [{
            bidirectionalBinding: false,
            sourceObjectType: {id: "x", name: "threatActor"},
            destinationObjectType: {id: "x", name: "person"}
        }]
    });

    const result = createFactRequest(
        uniDirectionalFactType,
        actObject({value: "BearSource", type: {id: "x", name: "threatActor"}}),
        {accessMode: "Public", type: "attributedTo"},
        null,
        {
            isSelectionSource: true,
            validOtherObjectTypes: [{id: "x", name: "person"}, {id: "x", name: "organization"}],
            otherObject: {value: "BadPerson", type: {id: "z", name: "person"}}},
        null);

    expect(result).toEqual({
        type: "attributedTo",
        value: "",
        sourceObject: "threatActor/BearSource",
        destinationObject: "person/BadPerson",
        accessMode: "Public"
    })
});

it('can make uni-directional fact requests with selection as destination', () => {

    const uniDirectionalFactType = factType({
        name: "attributedTo",
        relevantObjectBindings: [{
            bidirectionalBinding: false,
            sourceObjectType: {id: "x", name: "threatActor"},
            destinationObjectType: {id: "x", name: "person"}
        }]
    });

    const result = createFactRequest(
        uniDirectionalFactType,
        actObject({value: "BearDestination", type: {id: "x", name: "threatActor"}}),
        {accessMode: "Public", type: "attributedTo"},
        null,
        {
            isSelectionSource: false,
            validOtherObjectTypes: [{id: "x", name: "incident"}],
            otherObject: {value: "xyz", type: {id: "z", name: "incident"}}},
        null);

    expect(result).toEqual({
        type: "attributedTo",
        value: "",
        sourceObject: "incident/xyz",
        destinationObject: "threatActor/BearDestination",
        accessMode: "Public"
    })
});

it('can make one legged fact requests', () => {

    const oneLeggedFactType = factType({
        name: "name",
        relevantObjectBindings: [{
            bidirectionalBinding: false,
            sourceObjectType: {id: "x", name: "threatActor"},}]
    });

    const result = createFactRequest(
        oneLeggedFactType,
        actObject({value: "BearSource", type: {id: "x", name: "threatActor"}}),
        {accessMode: "Public", type: "name"},
        {value: "CareBear"},
        null,
        null);

    expect(result).toEqual({
        type: "name",
        sourceObject: "threatActor/BearSource",
        value: "CareBear",
        accessMode: "Public"
    })
});