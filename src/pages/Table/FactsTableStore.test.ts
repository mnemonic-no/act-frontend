import { columns, factRows } from './FactsTableStore';
import { fact, factTypes } from '../../core/testHelper';
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
      sortOrder: sortByFactType
    })
  ).toEqual([]);

  const aliasFact = fact({ id: 'a', type: factTypes.alias });
  const mentionsFact = fact({ id: 'b', type: factTypes.mentions });

  expect(
    factRows({
      facts: [aliasFact, mentionsFact],
      currentlySelected: {},
      columns: columns,
      factTypeFilter: new Set(),
      filterSelected: false,
      sortOrder: sortByFactType
    })
  ).toEqual([
    {
      id: aliasFact.id,
      cells: [
        { kind: 'sourceType', text: 'something' },
        { kind: 'sourceValue', text: '123' },
        { kind: 'factType', text: 'alias' },
        { kind: 'factValue', text: 'changeme' },
        { kind: 'destinationType', text: 'something' },
        { kind: 'destinationValue', text: '123' },
        { kind: 'isRetracted', text: '' },
        { kind: 'isBidirectional', text: '' },
        { kind: 'isOneLegged', text: '' }
      ],
      fact: aliasFact,
      isSelected: false
    },
    {
      id: mentionsFact.id,
      cells: [
        { kind: 'sourceType', text: 'something' },
        { kind: 'sourceValue', text: '123' },
        { kind: 'factType', text: 'mentions' },
        { kind: 'factValue', text: 'changeme' },
        { kind: 'destinationType', text: 'something' },
        { kind: 'destinationValue', text: '123' },
        { kind: 'isRetracted', text: '' },
        { kind: 'isBidirectional', text: '' },
        { kind: 'isOneLegged', text: '' }
      ],
      fact: mentionsFact,
      isSelected: false
    }
  ]);
});
