import React from 'react';
import { storiesOf } from '@storybook/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CreateFactForObjectDialog from '../src/components/CreateFactFor/Dialog';
import CreateFactForDialog from '../src/components/CreateFactFor/DialogStore';
import TimelineComp from '../src/components/Timeline/Timeline';
import { actTheme } from '../src/App';

storiesOf('Create fact dialog', module).add('create fact', () => {
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

const chartData = [
  { value: new Date(2010, 0, 1) },
  { value: new Date(2010, 0, 1) },
  { value: new Date(2014, 0, 1, 12, 15) },
  { value: new Date(2014, 0, 1, 12, 30) },
  { value: new Date(2014, 0, 1, 13, 20) },
  { value: new Date(2014, 0, 2) },
  { value: new Date(2014, 0, 3) },
  { value: new Date(2014, 0, 4) },
  { value: new Date(2014, 1, 1) },
  { value: new Date(2014, 1, 1) },
  { value: new Date(2014, 2, 1) },
  { value: new Date(2014, 3, 1) },
  { value: new Date(2014, 4, 1) },
  { value: new Date(2014, 5, 1) },
  { value: new Date(2014, 0, 5) },
  { value: new Date(2015, 0, 1) },
  { value: new Date(2015, 0, 2) },
  { value: new Date(2015, 0, 3) },
  { value: new Date(2016, 0, 1) },
  { value: new Date(2017, 0, 1) }
];

storiesOf('Timeline', module)
  .add('basic', () => {
    return (
      <MuiThemeProvider theme={actTheme}>
        <div>Years</div>
        <TimelineComp timeRange={[new Date(2010, 0, 1), new Date(2016, 0, 1)]} data={chartData} />
        <div>Year</div>
        <TimelineComp timeRange={[new Date(2014, 0, 1), new Date(2015, 0, 1)]} data={chartData} />
        <div>Month</div>
        <TimelineComp timeRange={[new Date(2014, 0, 1), new Date(2014, 1, 1)]} data={chartData} />
        <div>Day</div>
        <TimelineComp timeRange={[new Date(2014, 0, 1), new Date(2014, 0, 2)]} data={chartData} />
        <div>Hour</div>
        <TimelineComp timeRange={[new Date(2014, 0, 1, 12), new Date(2014, 0, 1, 14)]} data={chartData} />
      </MuiThemeProvider>
    );
  })
  .add('empty', () => {
    return (
      <MuiThemeProvider theme={actTheme}>
        <TimelineComp timeRange={[new Date(2013, 0, 1), new Date(2016, 0, 1)]} data={[]} />
      </MuiThemeProvider>
    );
  });
