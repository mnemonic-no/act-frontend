import { highlights } from './GraphViewStore';
import { fact } from '../../core/testHelper';

it('can highlight single fact', () => {
  expect(highlights([], {})).toEqual([]);

  expect(
    highlights(['someFactId'], {
      someFactId: fact({
        id: 'someFactId',
        timestamp: '2019-05-14T12:12:30.000Z',
        lastSeenTimestamp: '2019-05-14T12:12:30.000Z'
      })
    })
  ).toEqual([{ value: new Date('2019-05-14T12:12:30.000Z') }]);

  expect(highlights(['someFactId'], {})).toEqual([]);
});

it('can highlight multiple facts', () => {
  expect(
    highlights(['fact1', 'fact2'], {
      fact1: fact({
        id: 'fact1',
        timestamp: '2019-01-01T01:01:01.000Z',
        lastSeenTimestamp: '2019-02-02T02:02:00.000Z'
      }),
      fact2: fact({
        id: 'fact2',
        timestamp: '2019-04-04T04:04:04.000Z',
        lastSeenTimestamp: '2019-05-05T05:05:00.000Z'
      })
    })
  ).toEqual([{ value: new Date('2019-01-01T01:01:01.000Z') }, { value: new Date('2019-05-05T05:05:00.000Z') }]);
});
