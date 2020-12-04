import { resultToRows, selectedObjects } from './ResultsStore';
import { actObject, objectTypes, simpleSearch } from '../../../core/testHelper';
import { SortOrder } from '../../../components/ObjectTable';
import { LoadingStatus } from '../../../core/types';

it('test selectedObjects', () => {
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
      simpleSearch: simpleSearch({ result: { objects: [threatActor, report], facts: [] } }),
      objectTypeFilter: new Set(),
      selectedObjectIds: new Set([threatActor.id])
    })
  ).toEqual([threatActor]);

  expect(
    selectedObjects({
      simpleSearch: simpleSearch({ result: { objects: [threatActor, report] } }),
      objectTypeFilter: new Set(['report']),
      selectedObjectIds: new Set([threatActor.id, report.id])
    })
  ).toEqual([report]);
});

const ascObjectType: SortOrder = { order: 'asc', orderBy: 'objectType' };

it('can make result to rows', () => {
  expect(
    resultToRows({
      simpleSearch: {
        id: 'a',
        status: LoadingStatus.PENDING,
        args: { searchString: 'whatever', objectTypeFilter: [] }
      },
      objectTypeFilter: new Set(),
      selectedObjectIds: new Set(),
      sortOrder: ascObjectType,
      objectLabelFromFactType: null,
      objectColors: {}
    })
  ).toEqual([]);
  expect(
    resultToRows({
      simpleSearch: {
        id: 'a',
        status: LoadingStatus.PENDING,
        args: {
          searchString: 'whatever',
          objectTypeFilter: []
        }
      },
      objectTypeFilter: new Set(),
      selectedObjectIds: new Set(),
      sortOrder: ascObjectType,
      objectLabelFromFactType: null,
      objectColors: {}
    })
  ).toEqual([]);

  const someThreatActor = actObject({ id: 'x', type: objectTypes.threatActor });
  const someReport = actObject({ id: 'y', type: objectTypes.report });

  expect(
    resultToRows({
      simpleSearch: {
        id: 'a',
        status: LoadingStatus.DONE,
        args: {
          searchString: 'whatever',
          objectTypeFilter: []
        },
        result: {
          objects: [someThreatActor, someReport],
          facts: []
        }
      },
      selectedObjectIds: new Set([someReport.id]),
      objectTypeFilter: new Set(),
      sortOrder: ascObjectType,
      objectLabelFromFactType: null,
      objectColors: { report: 'green', threatActor: 'blue' }
    })
  ).toEqual([
    { actObject: someReport, isSelected: true, label: '', color: 'green' },
    { actObject: someThreatActor, isSelected: false, label: '', color: 'blue' }
  ]);
});

it('can filter rows by object type', () => {
  const someThreatActor = actObject({ id: 'x', type: objectTypes.threatActor });
  const someReport = actObject({ id: 'y', type: objectTypes.report });

  expect(
    resultToRows({
      simpleSearch: {
        id: 'a',
        status: LoadingStatus.DONE,
        args: {
          searchString: 'whatever',
          objectTypeFilter: []
        },
        result: {
          objects: [someThreatActor, someReport],
          facts: []
        }
      },
      selectedObjectIds: new Set(),
      objectTypeFilter: new Set([objectTypes.threatActor.name]),
      sortOrder: ascObjectType,
      objectLabelFromFactType: null,
      objectColors: {}
    })
  ).toEqual([{ actObject: someThreatActor, isSelected: false, label: '', color: 'inherit' }]);
});
