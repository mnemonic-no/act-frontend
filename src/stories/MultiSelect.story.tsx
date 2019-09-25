import React, { useState } from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';

import MultiSelect, { IMultiSelect } from '../components/MultiSelect';
import { actTheme } from '../App';
import * as _ from 'lodash/fp';

export default { title: 'Multiselect' };

const initialState: IMultiSelect = {
  id: 'my-multi-select',
  label: 'Filter',
  values: ['A', 'B', 'C'],
  selectedValues: [],
  emptyValue: 'Show all',
  onChange: (x: any) => {}
};

const BasicComp = () => {
  const [s, setS] = useState(initialState);

  const onChange = (selection: any) => {
    if (_.includes(initialState.emptyValue)(selection)) {
      setS({ ...s, selectedValues: [] });
    } else {
      setS({ ...s, selectedValues: selection });
    }
  };

  return (
    <MuiThemeProvider theme={actTheme}>
      <div style={{ padding: '10px' }}>
        <MultiSelect {...s} onChange={onChange} />
      </div>
    </MuiThemeProvider>
  );
};

export const withBasic = () => {
  // Hack while waiting for storybook to support hooks in inline components with the new CSF format
  return <BasicComp />;
};

withBasic.story = {
  name: 'with story'
};
