import React, { useState } from 'react';
import MuiThemeProvider from '@material-ui/styles/ThemeProvider';

import GroupByAccordion, { IGroup } from '../components/GroupByAccordion';

import { actTheme } from '../App';
import { objectTypeToColor } from '../util/util';

export default { title: 'GroupByAccordion' };

const BasicComp = () => {
  const [expanded, setExpanded] = useState({ threatActor: true });

  const accordion = {
    onToggle: (group: IGroup) => {
      // @ts-ignore
      setExpanded({ ...expanded, [group.title.text]: !Boolean(expanded[group.title.text]) });
    },
    groups: [
      {
        title: { text: 'content', color: objectTypeToColor('content') },
        actions: [],
        // @ts-ignore
        isExpanded: expanded['content'],
        items: [{ text: 'a', iconAction: { icon: 'close', tooltip: 'Remove', onClick: () => {} } }]
      },
      {
        title: { text: 'report', color: objectTypeToColor('report') },
        actions: [],
        // @ts-ignore
        isExpanded: expanded['report'],
        items: [
          {
            text: 'b',
            iconAction: {
              icon: 'close',
              tooltip: 'test',
              onClick: () => {}
            }
          },
          { text: 'c', iconAction: { icon: 'close', tooltip: 'Remove', onClick: () => {} } }
        ]
      },
      {
        title: { text: 'threatActor', color: objectTypeToColor('threatActor') },
        isExpanded: expanded['threatActor'],
        actions: [{ text: 'Query', onClick: () => {} }],
        items: [
          { text: 'Axiom', iconAction: { icon: 'close', tooltip: 'Remove', onClick: () => {} } },
          { text: 'Sofacy', iconAction: { icon: 'close', tooltip: 'Remove', onClick: () => {} } },
          {
            text: 'This text is too long This text is too long This text is too long This text is too long ',
            iconAction: { icon: 'close', tooltip: 'Remove', onClick: () => {} }
          }
        ]
      }
    ]
  };

  return (
    <MuiThemeProvider theme={actTheme}>
      <div style={{ width: '400px', backgroundColor: 'lightgrey', padding: 10 }}>
        <GroupByAccordion groups={accordion.groups} onToggle={accordion.onToggle} />
      </div>
    </MuiThemeProvider>
  );
};

export const basic = () => {
  // Hack while waiting for storybook to support hooks in inline components with the new CSF format
  return <BasicComp />;
};

basic.story = {
  name: 'basic'
};
