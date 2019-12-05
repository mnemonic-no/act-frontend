import React from 'react';
import MuiThemeProvider from '@material-ui/styles/ThemeProvider';

import FactStats, { FactStatsCellType } from '../components/FactStats';
import { actTheme } from '../App';

export default { title: 'FactStats' };

const rightAlign: 'right' = 'right';

export const basic = () => {
  return (
    <MuiThemeProvider theme={actTheme}>
      <div style={{ width: '400px' }}>
        <FactStats
          rows={[
            {
              tooltip: 'Execute search',
              onClick: () => {
                console.log('Row clicked');
              },
              cells: [
                { kind: FactStatsCellType.text, text: 'mentions' },
                { kind: FactStatsCellType.text, text: '30', align: rightAlign }
              ]
            },
            {
              cells: [
                { kind: FactStatsCellType.text, text: 'memberOf' },
                { kind: FactStatsCellType.text, text: '30', align: rightAlign }
              ]
            },
            {
              cells: [
                { kind: FactStatsCellType.text, text: 'category' },
                {
                  kind: FactStatsCellType.links,
                  links: [
                    { text: 'test', tag: true },
                    { text: 'blue', tag: true },
                    { text: 'external', tag: true }
                  ]
                }
              ]
            },
            {
              cells: [
                { kind: FactStatsCellType.text, text: 'name' },
                {
                  kind: FactStatsCellType.links,
                  links: [
                    {
                      text: 'The name',
                      tooltip: 'Show fact details',
                      onClick: () => console.log('Fact Clicked')
                    }
                  ]
                }
              ]
            }
          ]}
        />
      </div>
    </MuiThemeProvider>
  );
};
