import { factTypesToResolveByObjectId, matchFactTypesToObjectTypes, resultCount } from './dataLoaders';
import { actObject } from './testHelper';

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
        kind: 'objectFacts',
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
        kind: 'objectFacts',
        factTypes: [],
        objectValue: 'China',
        objectType: 'Country'
      },
      [objectStat('factX', 10), objectStat('factY', 20)]
    )
  ).toBe(30);

  expect(
    resultCount(
      {
        kind: 'objectFacts',
        factTypes: [],
        objectValue: 'China',
        objectType: 'Country'
      },
      []
    )
  ).toBe(0);

  expect(
    resultCount(
      {
        kind: 'objectFacts',
        factTypes: [],
        objectValue: 'China',
        objectType: 'Country'
      },
      undefined
    )
  ).toBe(0);
});

it('can count stats with factType filter', () => {
  expect(
    resultCount(
      {
        kind: 'objectFacts',
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
        kind: 'objectFacts',
        factTypes: ['factY'],
        objectValue: 'China',
        objectType: 'Country'
      },
      [objectStat('factX', 10), objectStat('factY', 20)]
    )
  ).toBe(20);
});

it('can match fact types to object types', () => {
  const autoResolveFactsConfig = {
    asn: ['name'],
    incident: ['name'],
    ipv4: ['sinkhole'],
    ipv6: ['sinkhole'],
    path: ['basename'],
    report: ['name'],
    uri: ['port', 'scheme']
  };

  expect(new Set(matchFactTypesToObjectTypes(autoResolveFactsConfig))).toEqual(
    new Set([
      { factTypes: ['name'], objectTypes: ['asn', 'incident', 'report'] },
      { factTypes: ['sinkhole'], objectTypes: ['ipv4', 'ipv6'] },
      { factTypes: ['basename'], objectTypes: ['path'] },
      { factTypes: ['port', 'scheme'], objectTypes: ['uri'] }
    ])
  );
});

it('can match fact types to object types with wildcard', () => {
  const autoResolveFactsConfig = {
    '*': ['name']
  };

  expect(new Set(matchFactTypesToObjectTypes(autoResolveFactsConfig))).toEqual(
    new Set([{ factTypes: ['name'], objectTypes: ['*'] }])
  );
});

it('can figure out which objects need which fact types resolved', () => {
  const autoResolveFactsConfig = {
    asn: ['name'],
    incident: ['name'],
    ipv4: ['sinkhole'],
    ipv6: ['sinkhole'],
    path: ['basename'],
    report: ['name'],
    uri: ['port', 'scheme']
  };

  const objects = [
    actObject({ id: '1', type: { id: 'r', name: 'report' } }),
    actObject({ id: '2', type: { id: 'a', name: 'asn' } }),
    actObject({ id: '3', type: { id: 'i', name: 'ipv4' } }),
    actObject({ id: '4', type: { id: 'x', name: 'willBeExcluded' } })
  ];

  expect(new Set(factTypesToResolveByObjectId(autoResolveFactsConfig, objects))).toEqual(
    new Set([
      { objectIds: ['1', '2'], factTypes: ['name'], objectTypes: ['asn', 'incident', 'report'] },
      { objectIds: ['3'], factTypes: ['sinkhole'], objectTypes: ['ipv4', 'ipv6'] }
    ])
  );
});

it('can auto resolve using *', () => {
  const autoResolveFactsConfig = {
    '*': ['category'],
    incident: ['name'],
    ipv4: ['sinkhole'],
    ipv6: ['sinkhole'],
    path: ['basename'],
    report: ['name'],
    uri: ['port', 'scheme']
  };

  const objects = [
    actObject({ id: '1', type: { id: 'r', name: 'report' } }),
    actObject({ id: '2', type: { id: 'a', name: 'asn' } }),
    actObject({ id: '3', type: { id: 'i', name: 'ipv4' } }),
    actObject({ id: '4', type: { id: 'x', name: 'country' } })
  ];

  expect(new Set(factTypesToResolveByObjectId(autoResolveFactsConfig, objects))).toEqual(
    new Set([
      {
        objectIds: ['1', '2', '3', '4'],
        factTypes: ['category'],
        objectTypes: ['*']
      },
      {
        objectIds: ['1'],
        factTypes: ['name'],
        objectTypes: ['incident', 'report']
      },
      { objectIds: ['3'], factTypes: ['sinkhole'], objectTypes: ['ipv4', 'ipv6'] }
    ])
  );
});
