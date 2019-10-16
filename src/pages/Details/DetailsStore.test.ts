import { factTypeLinks } from './DetailsStore';
import { fact, factTypes } from '../../core/testHelper';

it('fact type links', () => {
  expect(factTypeLinks([], () => {})).toEqual([]);

  const alias1 = fact({ id: 'a', type: factTypes.alias });
  const alias2 = fact({ id: 'b', type: factTypes.alias });
  const mentions = fact({ id: 'c', type: factTypes.mentions });
  const onClick = () => {};
  expect(factTypeLinks([alias1, alias2, mentions], onClick).map(x => x.text)).toEqual(['2 alias', '1 mentions']);
});
