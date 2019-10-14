import { MuiThemeProvider } from '@material-ui/core';
import { actTheme } from '../App';
import TimelineComp from '../components/Timeline/Timeline';
import React from 'react';

export default { title: 'Timeline' };

const chartData = [
  { id: '1', value: new Date(2010, 0, 1), kind: 'mentions' },
  { id: '2', value: new Date(2010, 0, 1), kind: 'mentions' },
  { id: '3', value: new Date(2014, 0, 1, 12, 15), kind: 'mentions', isHighlighted: true },
  { id: '4', value: new Date(2014, 0, 1, 12, 30), kind: 'alias', isHighlighted: true },
  { id: '5', value: new Date(2014, 0, 1, 13, 20), kind: 'name' },
  { id: '6', value: new Date(2014, 0, 2), kind: 'alias' },
  { id: '7', value: new Date(2014, 0, 3), kind: 'resolvesTo' },
  { id: '8', value: new Date(2014, 0, 4), kind: 'componentOf' },
  { id: '9', value: new Date(2014, 1, 1), kind: 'componentOf' },
  { id: '10', value: new Date(2014, 1, 1), kind: 'componentOf' },
  { id: '11', value: new Date(2014, 2, 1), kind: 'name' },
  { id: '12', value: new Date(2014, 3, 1), kind: 'scheme' },
  { id: '13', value: new Date(2014, 4, 1), kind: 'resolvesTo' },
  { id: '14', value: new Date(2014, 5, 1), kind: 'componentOf', isHighlighted: true },
  { id: '15', value: new Date(2014, 0, 5), kind: 'scheme' },
  { id: '16', value: new Date(2015, 0, 1), kind: 'scheme' },
  { id: '17', value: new Date(2015, 0, 2), kind: 'scheme' },
  { id: '18', value: new Date(2015, 0, 3), kind: 'name' },
  { id: '19', value: new Date(2016, 0, 1), kind: 'mentions' },
  { id: '20', value: new Date(2017, 0, 1), kind: 'mentions' }
];

export const empty = () => (
  <MuiThemeProvider theme={actTheme}>
    <TimelineComp timeRange={[new Date(2013, 0, 1), new Date(2016, 0, 1)]} histogram={[]} resizeEvent={1} />
  </MuiThemeProvider>
);

export const basic = () => (
  <MuiThemeProvider theme={actTheme}>
    <div>Years</div>
    <TimelineComp timeRange={[new Date(2010, 0, 1), new Date(2016, 0, 1)]} histogram={chartData} resizeEvent={1} />
    <div>Year</div>
    <TimelineComp timeRange={[new Date(2014, 0, 1), new Date(2015, 0, 1)]} histogram={chartData} resizeEvent={1} />
    <div>Month</div>
    <TimelineComp timeRange={[new Date(2014, 0, 1), new Date(2014, 1, 1)]} histogram={chartData} resizeEvent={1} />
    <div>Day</div>
    <TimelineComp timeRange={[new Date(2014, 0, 1), new Date(2014, 0, 2)]} histogram={chartData} resizeEvent={1} />
    <div>Hour</div>
    <TimelineComp
      timeRange={[new Date(2014, 0, 1, 12), new Date(2014, 0, 1, 14)]}
      histogram={chartData}
      resizeEvent={1}
    />
  </MuiThemeProvider>
);

export const scatterPlot = () => (
  <MuiThemeProvider theme={actTheme}>
    <div>Years</div>
    <TimelineComp
      timeRange={[new Date(2010, 0, 1), new Date(2016, 0, 1)]}
      histogram={chartData}
      scatterPlot={{ groups: [...new Set(chartData.map(x => x.kind))].sort().reverse(), data: chartData }}
      resizeEvent={1}
    />
  </MuiThemeProvider>
);
