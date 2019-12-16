import { accordionGroups, factTypeLinks } from './DetailsStore';
import { actObject, fact, factTypes, objectTypes } from '../../../core/testHelper';

it('fact type links', () => {
  expect(factTypeLinks([], () => {})).toEqual([]);

  const alias1 = fact({ id: 'a', type: factTypes.alias });
  const alias2 = fact({ id: 'b', type: factTypes.alias });
  const mentions = fact({ id: 'c', type: factTypes.mentions });
  const onClick = () => {};
  expect(factTypeLinks([alias1, alias2, mentions], onClick).map(x => x.text)).toEqual(['2 alias', '1 mentions']);
});

it('can make accordionGroups', () => {
  expect(accordionGroups({ actObjects: [], isAccordionExpanded: {}, unSelectFn: () => {} })).toEqual([]);

  expect(
    accordionGroups({
      actObjects: [
        actObject({ id: 'a', value: 'Sofacy', type: objectTypes.threatActor }),
        actObject({ id: 'b', value: '8.8.8.8', type: objectTypes.ipv4 })
      ],
      isAccordionExpanded: { ipv4: true },
      unSelectFn: () => {}
    })
  ).toEqual([
    expect.objectContaining({
      title: { text: 'threatActor', color: '#606' },
      isExpanded: undefined,
      actions: [{ text: 'Clear', onClick: expect.any(Function) }],
      items: [
        expect.objectContaining({
          text: 'Sofacy',
          iconAction: { icon: 'close', tooltip: 'Unselect', onClick: expect.any(Function) }
        })
      ]
    }),
    expect.objectContaining({
      title: { text: 'ipv4', color: '#00c' },
      isExpanded: true,
      actions: [{ text: 'Clear', onClick: expect.any(Function) }],
      items: [
        expect.objectContaining({
          text: '8.8.8.8',
          iconAction: { icon: 'close', tooltip: 'Unselect', onClick: expect.any(Function) }
        })
      ]
    })
  ]);
});
