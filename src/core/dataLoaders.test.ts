import { resultCount } from './dataLoaders';

const objectStat = (type: string, count: number) => ({
  lastAddedTimestamp: '',
  lastSeenTimestamp: '',
  count: count,
  type: { id: '1', name: type }
});

it('can count stats', () => {
  expect(
    resultCount(
      {
        factTypes: [],
        objectValue: 'China',
        objectType: 'Country'
      },
      [objectStat('factX', 10)]
    )
  ).toBe(10);

  expect(
    resultCount(
      {
        factTypes: [],
        objectValue: 'China',
        objectType: 'Country'
      },
      [objectStat('factX', 10), objectStat('factY', 20)]
    )
  ).toBe(30);
});

it('can count stats with factType filter', () => {
  expect(
    resultCount(
      {
        factTypes: ['factY'],
        objectValue: 'China',
        objectType: 'Country'
      },
      [objectStat('factX', 10)]
    )
  ).toBe(0);

  expect(
    resultCount(
      {
        factTypes: ['factY'],
        objectValue: 'China',
        objectType: 'Country'
      },
      [objectStat('factX', 10), objectStat('factY', 20)]
    )
  ).toBe(20);
});
