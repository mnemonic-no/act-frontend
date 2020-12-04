import { objectTitle } from './DetailsStore';
import { actObject, objectTypes } from '../../../core/testHelper';

it('can make objectTitle', () => {
  const threatActor = actObject({ id: 'a', type: objectTypes.threatActor });

  expect(objectTitle(threatActor, 'name', [], { threatActor: '#606' })).toEqual({
    title: threatActor.value,
    metaTitle: '',
    subTitle: 'threatActor',
    color: '#606'
  });
});
