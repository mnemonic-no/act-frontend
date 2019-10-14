import { MuiThemeProvider } from '@material-ui/core';
import { actTheme } from '../App';
import TimelineComp from '../components/Timeline/Timeline';
import React from 'react';

export default { title: 'Timeline' };

const chartData = [
  { id: '1', value: new Date(2010, 0, 1) },
  { id: '2', value: new Date(2010, 0, 1) },
  { id: '3', value: new Date(2014, 0, 1, 12, 15) },
  { id: '4', value: new Date(2014, 0, 1, 12, 30) },
  { id: '5', value: new Date(2014, 0, 1, 13, 20) },
  { id: '6', value: new Date(2014, 0, 2) },
  { id: '7', value: new Date(2014, 0, 3) },
  { id: '8', value: new Date(2014, 0, 4) },
  { id: '9', value: new Date(2014, 1, 1) },
  { id: '10', value: new Date(2014, 1, 1) },
  { id: '11', value: new Date(2014, 2, 1) },
  { id: '12', value: new Date(2014, 3, 1) },
  { id: '13', value: new Date(2014, 4, 1) },
  { id: '14', value: new Date(2014, 5, 1) },
  { id: '15', value: new Date(2014, 0, 5) },
  { id: '16', value: new Date(2015, 0, 1) },
  { id: '17', value: new Date(2015, 0, 2) },
  { id: '18', value: new Date(2015, 0, 3) },
  { id: '19', value: new Date(2016, 0, 1) },
  { id: '20', value: new Date(2017, 0, 1) }
];

export const empty = () => (
  <MuiThemeProvider theme={actTheme}>
    <TimelineComp timeRange={[new Date(2013, 0, 1), new Date(2016, 0, 1)]} data={[]} resizeEvent={1} />
  </MuiThemeProvider>
);

export const basic = () => (
  <MuiThemeProvider theme={actTheme}>
    <div>Years</div>
    <TimelineComp timeRange={[new Date(2010, 0, 1), new Date(2016, 0, 1)]} data={chartData} resizeEvent={1} />
    <div>Year</div>
    <TimelineComp timeRange={[new Date(2014, 0, 1), new Date(2015, 0, 1)]} data={chartData} resizeEvent={1} />
    <div>Month</div>
    <TimelineComp timeRange={[new Date(2014, 0, 1), new Date(2014, 1, 1)]} data={chartData} resizeEvent={1} />
    <div>Day</div>
    <TimelineComp timeRange={[new Date(2014, 0, 1), new Date(2014, 0, 2)]} data={chartData} resizeEvent={1} />
    <div>Hour</div>
    <TimelineComp timeRange={[new Date(2014, 0, 1, 12), new Date(2014, 0, 1, 14)]} data={chartData} resizeEvent={1} />
  </MuiThemeProvider>
);
