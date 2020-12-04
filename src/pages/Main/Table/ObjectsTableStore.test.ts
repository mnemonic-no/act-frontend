import { objectRows } from './ObjectsTableStore';
import { actObject, objectTypes } from '../../../core/testHelper';
import { SortOrder } from './ObjectsTable';

const sortByObjectType: SortOrder = { order: 'asc', orderBy: 'objectType' };

it('can make objectRows', () => {
  expect(
    objectRows({
      objects: [],
      objectTypeFilter: new Set(),
      currentlySelected: {},
      filterSelected: false,
      facts: [],
      sortOrder: sortByObjectType,
      objectColors: {}
    })
  ).toEqual([]);

  const threatActor = actObject({ id: 'a', type: objectTypes.threatActor });
  const report = actObject({ id: 'b', type: objectTypes.report });

  expect(
    objectRows({
      objects: [threatActor, report],
      objectTypeFilter: new Set(),
      currentlySelected: {},
      filterSelected: false,
      facts: [],
      sortOrder: sortByObjectType,
      objectColors: { threatActor: 'green', report: 'red' }
    })
  ).toEqual([
    { id: report.id, actObject: report, isSelected: false, properties: [], title: 'report', color: 'red' },
    {
      id: threatActor.id,
      actObject: threatActor,
      isSelected: false,
      properties: [],
      title: 'threatActor',
      color: 'green'
    }
  ]);
});
