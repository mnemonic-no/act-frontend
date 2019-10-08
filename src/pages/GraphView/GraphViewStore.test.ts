import { highlights } from './GraphViewStore';
import { fact } from '../../core/testHelper';

it('can highlight', () => {
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
