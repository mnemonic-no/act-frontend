import { columns, factRows } from './FactsTableStore';
import { fact, factTypes } from '../../../core/testHelper';
import { SortOrder } from './FactsTable';

const sortByFactType: SortOrder = { order: 'asc', orderBy: 'factType' };

it('can make facts table', () => {
  expect(
    factRows({
      facts: [],
      currentlySelected: {},
      columns: [],
      factTypeFilter: new Set(),
      filterSelected: false,
      sortOrder: sortByFactType,
      isExport: true
    })
  ).toEqual([]);

  const aliasFact = fact({
    id: 'a',
    type: factTypes.alias,
    timestamp: '2019-05-14T12:12:30.000Z',
    lastSeenTimestamp: '2019-05-14T12:12:30.000Z'
  });
  const mentionsFact = fact({ id: 'b', type: factTypes.mentions });

  expect(
    factRows({
      facts: [aliasFact, mentionsFact],
      currentlySelected: {},
      columns: columns,
      factTypeFilter: new Set(),
      filterSelected: false,
      sortOrder: sortByFactType,
      isExport: true
    })
  ).toEqual([
    {
      id: aliasFact.id,
      cells: [
        { kind: 'timestamp', text: aliasFact.timestamp, isFaded: false },
        { kind: 'lastSeenTimestamp', text: aliasFact.lastSeenTimestamp, isFaded: true },
        { kind: 'sourceType', text: 'something', isFaded: false },
        { kind: 'sourceValue', text: '123', isFaded: false },
        { kind: 'factType', text: 'alias', isFaded: false },
        { kind: 'factValue', text: 'changeme', isFaded: false },
        { kind: 'destinationType', text: 'something', isFaded: false },
        { kind: 'destinationValue', text: '123', isFaded: false },
        { kind: 'isRetracted', text: '', isFaded: false },
        { kind: 'isBidirectional', text: '', isFaded: false },
        { kind: 'isOneLegged', text: '', isFaded: false }
      ],
      fact: aliasFact,
      isSelected: false
    },
    {
      id: mentionsFact.id,
      cells: [
        { kind: 'timestamp', text: mentionsFact.timestamp, isFaded: false },
        { kind: 'lastSeenTimestamp', text: mentionsFact.lastSeenTimestamp, isFaded: false },
        { kind: 'sourceType', text: 'something', isFaded: false },
        { kind: 'sourceValue', text: '123', isFaded: false },
        { kind: 'factType', text: 'mentions', isFaded: false },
        { kind: 'factValue', text: 'changeme', isFaded: false },
        { kind: 'destinationType', text: 'something', isFaded: false },
        { kind: 'destinationValue', text: '123', isFaded: false },
        { kind: 'isRetracted', text: '', isFaded: false },
        { kind: 'isBidirectional', text: '', isFaded: false },
        { kind: 'isOneLegged', text: '', isFaded: false }
      ],
      fact: mentionsFact,
      isSelected: false
    }
  ]);
});
