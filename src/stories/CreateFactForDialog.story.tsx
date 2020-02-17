import React from 'react';
import { storiesOf } from '@storybook/react';
import MuiThemeProvider from '@material-ui/styles/ThemeProvider';

import { actTheme } from '../App';
import CreateFactForDialog from '../components/CreateFactFor/DialogStore';
import CreateFactForObjectDialog from '../components/CreateFactFor/Dialog';
import { factType } from '../core/testHelper';

storiesOf('Create fact dialog', module).add('create fact', () => {
  // @ts-ignore
  const store = new CreateFactForDialog(
    { value: 'Sofacy', typeName: 'threatActor' },
    [
      factType({
        id: '1',
        name: 'alias',
        relevantObjectBindings: [
          {
            bidirectionalBinding: true,
            sourceObjectType: { id: 'ta', name: 'threatActor' },
            destinationObjectType: { id: 'ta', name: 'threatActor' }
          }
        ]
      }),
      factType({
        id: '2',
        name: 'attributedTo',
        relevantObjectBindings: [
          {
            bidirectionalBinding: false,
            sourceObjectType: { id: 'ta', name: 'threatActor' },
            destinationObjectType: { id: 'p', name: 'person' }
          },
          {
            bidirectionalBinding: false,
            sourceObjectType: { id: 'ta', name: 'threatActor' },
            destinationObjectType: { id: 'o', name: 'organization' }
          },
          {
            bidirectionalBinding: false,
            sourceObjectType: { id: 'i', name: 'incident' },
            destinationObjectType: { id: 'ta', name: 'threatActor' }
          }
        ]
      })
    ],
    () => {}
  );
  return (
    <MuiThemeProvider theme={actTheme}>
      <CreateFactForObjectDialog store={store} />
    </MuiThemeProvider>
  );
});
