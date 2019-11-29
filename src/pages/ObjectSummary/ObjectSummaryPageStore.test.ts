import { countByObjectTypeString } from './ObjectSummaryPageStore';
import { actObject, objectTypes } from '../../core/testHelper';

it('can count objects by type', () => {
  expect(countByObjectTypeString([])).toEqual('');

  expect(
    countByObjectTypeString([
      actObject({ type: objectTypes.threatActor }),
      actObject({ type: objectTypes.threatActor }),
      actObject({ type: objectTypes.threatActor }),
      actObject({ type: objectTypes.incident })
    ])
  ).toEqual('threatActor (3), incident (1)');
});
