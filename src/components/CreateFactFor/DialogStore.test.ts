import { createFactRequest, objectValueSuggestions } from './DialogStore';
import { actObject, factType, objectTypes, simpleSearch } from '../../core/testHelper';
import { LoadingStatus } from '../../core/types';

it('can make bi-directional fact requests', () => {
  const biDirectionalFactType = factType({
    name: 'alias',
    relevantObjectBindings: [
      {
        bidirectionalBinding: true,
        sourceObjectType: { id: 'x', name: 'threatActor' },
        destinationObjectType: { id: 'x', name: 'threatActor' }
      }
    ]
  });

  const result = createFactRequest(
    biDirectionalFactType,
    { typeName: 'threatActor', value: 'BearSource' },
    { accessMode: 'Public', type: 'alias' },
    null,
    null,
    {
      inputValue: 'BearDestination',
      validOtherObjectTypes: [{ id: 'x', name: 'threatActor' }],
      otherObject: { value: 'BearDestination', typeName: 'threatActor' }
    }
  );

  expect(result).toEqual({
    type: 'alias',
    value: '',
    bidirectionalBinding: true,
    sourceObject: 'threatActor/BearSource',
    destinationObject: 'threatActor/BearDestination',
    accessMode: 'Public'
  });
});

it('can make uni-directional fact requests', () => {
  const uniDirectionalFactType = factType({
    name: 'attributedTo',
    relevantObjectBindings: [
      {
        bidirectionalBinding: false,
        sourceObjectType: { id: 'x', name: 'threatActor' },
        destinationObjectType: { id: 'x', name: 'person' }
      }
    ]
  });

  const result = createFactRequest(
    uniDirectionalFactType,
    { value: 'BearSource', typeName: 'threatActor' },
    { accessMode: 'Public', type: 'attributedTo' },
    null,
    {
      inputValue: 'BadPerson',
      isSelectionSource: true,
      validOtherObjectTypes: [
        { id: 'x', name: 'person' },
        { id: 'x', name: 'organization' }
      ],
      otherObject: { value: 'BadPerson', typeName: 'person' }
    },
    null
  );

  expect(result).toEqual({
    type: 'attributedTo',
    value: '',
    sourceObject: 'threatActor/BearSource',
    destinationObject: 'person/BadPerson',
    accessMode: 'Public'
  });
});

it('can make uni-directional fact requests with selection as destination', () => {
  const uniDirectionalFactType = factType({
    name: 'attributedTo',
    relevantObjectBindings: [
      {
        bidirectionalBinding: false,
        sourceObjectType: { id: 'x', name: 'threatActor' },
        destinationObjectType: { id: 'x', name: 'person' }
      }
    ]
  });

  const result = createFactRequest(
    uniDirectionalFactType,
    { value: 'BearDestination', typeName: 'threatActor' },
    { accessMode: 'Public', type: 'attributedTo' },
    null,
    {
      inputValue: 'xyz',
      isSelectionSource: false,
      validOtherObjectTypes: [{ id: 'x', name: 'incident' }],
      otherObject: { value: 'xyz', typeName: 'incident' }
    },
    null
  );

  expect(result).toEqual({
    type: 'attributedTo',
    value: '',
    sourceObject: 'incident/xyz',
    destinationObject: 'threatActor/BearDestination',
    accessMode: 'Public'
  });
});

it('can make one legged fact requests', () => {
  const oneLeggedFactType = factType({
    name: 'name',
    relevantObjectBindings: [
      {
        bidirectionalBinding: false,
        sourceObjectType: { id: 'x', name: 'threatActor' }
      }
    ]
  });

  const result = createFactRequest(
    oneLeggedFactType,
    { value: 'BearSource', typeName: 'threatActor' },
    { accessMode: 'Public', type: 'name' },
    { value: 'CareBear' },
    null,
    null
  );

  expect(result).toEqual({
    type: 'name',
    sourceObject: 'threatActor/BearSource',
    value: 'CareBear',
    accessMode: 'Public'
  });
});

it('can make objectValueSuggestions with empty input', () => {
  const suggestions = objectValueSuggestions(simpleSearch({ status: LoadingStatus.PENDING }), {});
  expect(suggestions).toEqual([]);
});

it('can make objectValueSuggestions', () => {
  const report = actObject({ id: 'b', type: objectTypes.report, value: 'A report' });
  const threatActor = actObject({ id: 'a', type: objectTypes.threatActor, value: 'BadPanda' });

  const suggestions = objectValueSuggestions(simpleSearch({ result: { objects: [threatActor, report], facts: [] } }), {
    objectColors: { report: 'green', threatActor: 'blue' }
  });
  expect(suggestions).toEqual([
    {
      actObject: report,
      color: 'green',
      objectLabel: 'A report'
    },
    {
      actObject: threatActor,
      color: 'blue',
      objectLabel: 'BadPanda'
    }
  ]);
});
