import { selectedObjects } from './ResultsStore';
import { actObject, objectTypes, simpleSearch } from '../../../core/testHelper';

it('test selectedObject', () => {
  expect(
    selectedObjects({
      simpleSearch: simpleSearch({}),
      objectTypeFilter: new Set(),
      selectedObjectIds: new Set()
    })
  ).toEqual([]);

  const threatActor = actObject({ id: 'a', type: objectTypes.threatActor });
  const report = actObject({ id: 'b', type: objectTypes.report });

  expect(
    selectedObjects({
      simpleSearch: simpleSearch({ objects: [threatActor, report] }),
      objectTypeFilter: new Set(),
      selectedObjectIds: new Set([threatActor.id])
    })
  ).toEqual([threatActor]);

  expect(
    selectedObjects({
      simpleSearch: simpleSearch({ objects: [threatActor, report] }),
      objectTypeFilter: new Set(['report']),
      selectedObjectIds: new Set([threatActor.id, report.id])
    })
  ).toEqual([report]);
});
