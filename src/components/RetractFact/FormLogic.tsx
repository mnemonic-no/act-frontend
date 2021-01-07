import { compose, withPropsOnChange } from 'recompose';

import deformed from '../../util/deformed';
import RetractFactFormComp from './Form';

const Fields = {
  comment: '',
  accessMode: 'Public'
};

export default compose(
  withPropsOnChange([], ({ fact }: any) => ({
    initialFields: {
      accessMode: fact.accessMode
    }
  })),
  deformed(Fields)
  // @ts-ignore
)(RetractFactFormComp);
