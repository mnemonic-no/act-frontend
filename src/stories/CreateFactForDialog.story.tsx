import React from 'react';
import { storiesOf } from '@storybook/react';
import MuiThemeProvider from '@material-ui/styles/ThemeProvider';

import { actTheme } from '../App';
import CreateFactForDialog from '../components/CreateFactFor/DialogStore';
import CreateFactForObjectDialog from '../components/CreateFactFor/Dialog';

storiesOf('Create fact dialog', module).add('create fact', () => {
  // @ts-ignore
  const store = new CreateFactForDialog({ id: 'x', value: 'Sofacy', type: { id: 'x', name: 'threatActor' } }, {}, [
    {
      id: '1',
      name: 'alias',
      relevantObjectBindings: [
        {
          bidirectionalBinding: true,
          sourceObjectType: { id: 'x', name: 'threatActor' },
          destinationObjectType: { id: 'x', name: 'threatActor' }
        }
      ]
    }
  ]);
  return (
    <MuiThemeProvider theme={actTheme}>
      <CreateFactForObjectDialog store={store} />
    </MuiThemeProvider>
  );
});
