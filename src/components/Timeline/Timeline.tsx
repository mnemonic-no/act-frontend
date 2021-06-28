import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as _ from 'lodash/fp';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';

import { useOnResize, usePrevious } from '../../hooks';
import { pluralize } from '../../util/util';

const defaultContainerSize = { width: 900, height: 180 };
const margin = { top: 20, right: 70, bottom: 30, left: 40 };

const useStyles = makeStyles((theme: Theme) => ({
  chartRoot: {
    '& .xAxis': { color: theme.palette.primary.light },
    '& .yAxis': { color: theme.palette.primary.light },
    '& .grid': {
      color: theme.palette.grey['600'],
      opacity: 0.07
    },
    '& .grid path': {
      visibility: 'hidden'
    },
    '& .histogram': {
      strokeWidth: 0.5,
      stroke: theme.palette.grey['400'],
      fill: theme.palette.grey['200']
    },
    '& .scatterplot': {
      fill: theme.palette.grey['700']
    },
    '& .highlighted': {
      fill: theme.palette.secondary.light
    },

    '& .halo': {
      fill: theme.palette.secondary.light,
      animation: '$hideshow 1s ease-in-out infinite alternate'
    }
  },
  root: {
    width: '100%',
    height: '180px',
    position: 'relative',

    '& .tooltip': {
      fontSize: '0.9rem',
      position: 'absolute',
      borderRadius: '5px',
      zIndex: 99999,
      backgroundColor: theme.palette.grey.A700,
      color: theme.palette.common.white,
      padding: '6px',
      pointerEvents: 'none',
      transition: 'all 0.1s ease',
      opacity: 0
    },
    '& .tooltip h1': {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      margin: 0
    },

    '& .halo': {
      animation: '$hideshow 0.7s ease-in-out infinite alternate'
    }
  },
  '@keyframes hideshow': {
    from: { opacity: 0.5 },
    to: { opacity: 0 }
  }
}));

const formatMillisecond = d3.timeFormat('.%L'),
  formatSecond = d3.timeFormat(':%S'),
  formatMinute = d3.timeFormat('%H:%M'),
  formatHour = d3.timeFormat('%H'),
  formatDay = d3.timeFormat('%a %d'),
  formatWeek = d3.timeFormat('%b %d'),
  formatMonth = d3.timeFormat('%B'),
  formatYear = d3.timeFormat('%Y');

const multiFormat = (date: Date): string => {
  return (
    d3.timeSecond(date) < date
      ? formatMillisecond
      : d3.timeMinute(date) < date
      ? formatSecond
      : d3.timeHour(date) < date
      ? formatMinute
      : d3.timeDay(date) < date
      ? formatHour
      : d3.timeMonth(date) < date
      ? d3.timeWeek(date) < date
        ? formatDay
        : formatWeek
      : d3.timeYear(date) < date
      ? formatMonth
      : formatYear
  )(date);
};

const mouseOver = (children: Array<{ selector: string; opacity: number }>, tooltipEl: any) => {
  return (d: any, i: number, nodes: any) => {
    tooltipEl.style('opacity', 0.9);

    for (let { selector, opacity } of children) {
      d3.select(nodes[i]).select(selector).style('opacity', opacity);
    }
  };
};

const mouseLeave = (children: Array<{ selector: string; opacity: number }>, tooltipEl: any) => {
  return (d: any, i: number, nodes: any) => {
    tooltipEl.style('opacity', 0);

    for (let { selector, opacity } of children) {
      d3.select(nodes[i]).select(selector).style('opacity', opacity);
    }
  };
};

const mouseMove = (targetSelector: string, tooltipEl: any) => {
  return (d: any, i: number, nodes: any) => {
    const targetEl = d3.select(nodes[i]).select(targetSelector);
    // @ts-ignore
    const [x, y] = d3.mouse(targetEl.node());

    const tooltipLeft = _.max([x - margin.left - margin.right, margin.left]);

    const details = targetEl.attr('data-details')
      ? targetEl
          .attr('data-details')
          .split(',')
          .reduce((acc, detailStr) => {
            return acc + `<div>${detailStr}</div>`;
          }, '')
      : '';

    tooltipEl.style('top', y - 100 + 'px').style('left', tooltipLeft + 'px');
    tooltipEl.html(
      `<h1>${pluralize(parseInt(targetEl.attr('data-count')), 'fact')}</h1>` +
        `<div>${d3.timeFormat('%Y-%m-%d %H:%M:%S')(new Date(targetEl.attr('data-from')))}</div>` +
        `<div style="padding-bottom: 2px">${d3.timeFormat('%Y-%m-%d %H:%M:%S')(
          new Date(targetEl.attr('data-to'))
        )}</div>` +
        details
    );
  };
};

const xScaleFn = (domain: [Date, Date], range: [number, number]) => {
  return d3.scaleTime().domain(domain).nice().range(range);
};

const linearScaleFn = (domain: [number, number], range: [number, number]) => {
  return d3.scaleLinear().domain(domain).range(range);
};

const drawXAxis = (e: any, scaleFn: any, containerHeight: number) => {
  if (e.select('.xAxis').empty()) {
    e.append('g').attr('class', 'xAxis');
  }

  const xAxis = d3
    .axisBottom(scaleFn)
    .ticks(10)
    .tickFormat((d: any, i: number) => {
      // Always show the year-month-day on the first tick
      if (i === 0) {
        return d3.timeFormat('%Y-%m-%d')(d);
      }
      return multiFormat(d);
    });

  const update = e.select('.xAxis');

  update.attr('transform', `translate(0 ${containerHeight})`).call(xAxis);
};

const drawYAxis = (el: any, scaleFn: any) => {
  if (el.select('.yAxis').empty()) {
    el.append('g').attr('class', 'yAxis');
  }

  const numberOfTicks = _.min([scaleFn.domain()[1], 10]);

  const yAxis = d3
    .axisLeft(scaleFn)
    .ticks(numberOfTicks)
    // @ts-ignore
    .tickFormat(d3.format('d'))
    .tickSizeOuter(0);

  el.select('.yAxis').attr('transform', 'translate(0 0)').call(yAxis);
};

const drawScatterPlotAxis = (el: any, scaleFn: any, width: number) => {
  if (el.select('.yAxisScatter').empty()) {
    el.append('g').attr('class', 'yAxisScatter');
  }

  const numberOfTicks = _.min([scaleFn.domain()[1], 10]);

  const yAxis = d3.axisRight(scaleFn).ticks(numberOfTicks).tickSizeOuter(0);

  el.select('.yAxisScatter').attr('transform', `translate(${width} 0)`).call(yAxis);
};

const drawGrid = (el: any, xScale: any, yScale: any, width: number) => {
  if (el.select('.grid').empty()) {
    const grid = el.append('g').attr('class', 'grid');
    grid.append('g').attr('class', 'yGrid');
  }

  const yAxisGrid = d3
    .axisLeft(yScale)
    .tickSize(-width)
    // @ts-ignore
    .tickFormat('')
    .ticks(5);

  el.select('.yGrid').call(yAxisGrid);
};

export const factTypeDetailsString = (bin: Array<{ kind: string }>) => {
  return _.pipe(
    _.reduce((acc: any, curr: any) => {
      acc[curr.kind] = (acc[curr.kind] || 0) + 1;
      return acc;
    }, {}),
    _.entries,
    _.sortBy(([k, v]: [string, number]) => k),
    _.map(([k, v]: [string, number]) => v + ' ' + k),
    _.join(',')
  )(bin);
};

const drawHistogram = (
  el: any,
  container: any,
  xScale: d3.ScaleTime<number, number>,
  yScale: any,
  data: Array<BinPoint>,
  containerHeight: number,
  onBinClick?: (bin: Array<{ value: Date; id: string }>) => void
) => {
  if (el.select('.histogram').empty()) {
    el.append('g').attr('class', 'histogram');
    container.append('div').attr('class', 'tooltip');
  }

  const binGroup = el
    .select('.histogram')
    .selectAll('g')
    .data(data, (d: any) => d);
  binGroup.exit().remove();

  const binGroupEnter = binGroup
    .enter()
    .append('g')
    .on(
      'mouseover',
      mouseOver(
        [
          { selector: '.bin', opacity: 0.6 },
          { selector: '.mouseCatcher', opacity: 0.4 }
        ],
        container.select('.tooltip')
      )
    )
    .on(
      'mouseleave',
      mouseLeave(
        [
          { selector: '.bin', opacity: 1 },
          { selector: '.mouseCatcher', opacity: 0 }
        ],
        container.select('.tooltip')
      )
    )
    .on('mousemove', mouseMove('.bin', container.select('.tooltip')))
    .on('mousedown', onBinClick ? onBinClick : () => {});

  // The bin
  binGroupEnter
    .append('rect')
    .attr('class', 'bin')
    .merge(binGroup.select('.bin'))
    .attr('x', (d: any) => xScale(d.x0))
    .attr('height', (d: any) => containerHeight - yScale(d.length))
    .attr('data-count', (d: any) => d.length)
    .attr('data-from', (d: any) => d.x0)
    .attr('data-to', (d: any) => d.x1)
    .attr('data-details', (d: any) => factTypeDetailsString(d))
    .attr('y', (d: any) => yScale(d.length))
    // @ts-ignore
    .attr('width', (d: any) => xScale(d.x1) - xScale(d.x0));

  // Makes the mouse target always fill the height of the chart, regardless of actual bin height
  binGroupEnter
    .append('rect')
    .attr('class', 'mouseCatcher')
    .style('opacity', 0)
    .merge(binGroup.select('.mouseCatcher'))
    .attr('x', (d: any) => xScale(d.x0))
    .attr('height', (d: any) => containerHeight)
    // @ts-ignore
    .attr('width', (d: any) => xScale(d.x1) - xScale(d.x0));
};

const drawScatterPlot = (
  el: any,
  xScale: d3.ScaleTime<number, number>,
  yScale: any,
  scatterPlot: Array<ScatterPoint>
) => {
  if (el.select('.scatterplot').empty()) {
    const sel = el.append('g').attr('pointer-events', 'none').attr('class', 'scatterplot');

    sel.append('g').attr('class', 'non-highlighted');
    sel.append('g').attr('class', 'highlighted');
  }

  const highlighted = el
    .select('.scatterplot')
    .select('.highlighted')
    .selectAll('g')
    .data(
      scatterPlot.filter(x => x.isHighlighted),
      (d: any) => {
        return d && d.id;
      }
    );

  highlighted.exit().remove();

  const enterHighligted = highlighted.enter().append('g');

  enterHighligted.append('circle').attr('class', 'halo').attr('r', 4.5).attr('cx', 0).attr('cy', 0);

  enterHighligted.append('circle').attr('r', 3.5).attr('cx', 0).attr('cy', 0);

  enterHighligted
    .merge(highlighted)
    .attr('transform', (d: any) => `translate(${xScale(d.value)} ${yScale(d.kind) + yScale.bandwidth() / 2})`);

  const nonHighlighted = el
    .select('.scatterplot')
    .select('.non-highlighted')
    .selectAll('circle')
    .data(
      scatterPlot.filter(x => !x.isHighlighted),
      (d: any) => d.id
    );

  nonHighlighted.exit().remove();

  nonHighlighted
    .enter()
    .append('circle')
    .merge(nonHighlighted)
    .attr('r', 2.5)
    .attr('cx', (d: any) => xScale(d.value))
    .attr('cy', (d: any) => yScale(d.kind) + yScale.bandwidth() / 2);
};

const secondsInYear = 60 * 60 * 24 * 365;
const secondsInMonth = 60 * 60 * 24 * 31;
const secondsInWeek = 60 * 60 * 24 * 7;
const secondsInDay = 60 * 60 * 24;
const secondsInHour = 60 * 60;

const binSize = (timeRange: [Date, Date]) => {
  const timeRangeInSec = d3.timeSecond.count(timeRange[0], timeRange[1]);

  if (timeRangeInSec > secondsInYear * 10) {
    return d3.timeYear;
  } else if (timeRangeInSec > secondsInYear * 4) {
    return d3.timeMonth;
  } else if (timeRangeInSec > secondsInWeek * 26) {
    return d3.timeWeek;
  } else if (timeRangeInSec > secondsInMonth / 2) {
    return d3.timeDay;
  } else if (timeRangeInSec > secondsInDay / 2) {
    return d3.timeHour;
  } else if (timeRangeInSec > secondsInHour) {
    return d3.timeMinute;
  } else {
    return d3.timeSecond;
  }
};

interface IDrawData {
  el: any;
  container: any;
  width: number;
  height: number;
  histogram: Array<BinPoint>;
  scatterPlot?: {
    groups: Array<string>;
    data: Array<ScatterPoint>;
  };
  timeRange: [Date, Date];
  onBinClick?: (bin: Array<{ value: Date; id: string }>) => void;
}

const d3Draw = ({ el, container, width, height, histogram, scatterPlot, timeRange, onBinClick }: IDrawData) => {
  const xScale = xScaleFn(timeRange, [0, width]);
  const histogramFn = d3
    .histogram()
    .value((d: any) => d.value)
    // @ts-ignore
    .domain(xScale.domain())
    // @ts-ignore
    .thresholds(xScale.ticks(binSize(timeRange)));

  // @ts-ignore
  const bins = histogramFn(histogram).filter((bin: Array<{ value: Date }>) => bin.length > 0);

  // @ts-ignore
  const maxY: number = d3.max(bins, (x: Array) => x.length);
  const yScale = linearScaleFn([0, maxY === 0 ? 1 : maxY], [height, 0]);

  drawGrid(el, xScale, yScale, width);
  drawHistogram(el, container, xScale, yScale, bins, height, onBinClick);
  if (scatterPlot) {
    const yScaleScatter = d3.scaleBand().domain(scatterPlot.groups).range([height, 0]);

    drawScatterPlot(el, xScale, yScaleScatter, scatterPlot.data);
    drawScatterPlotAxis(el, yScaleScatter, width);
  }
  drawYAxis(el, yScale);
  drawXAxis(el, xScale, height);
};

const TimelineComp = (inputProps: IProps) => {
  const { histogram, timeRange, resizeEvent, scatterPlot, onBinClick } = inputProps;
  const classes = useStyles();

  const [containerSize, setContainerState] = useState(defaultContainerSize);

  const d3Container = useRef(null);
  const previousProps = usePrevious({ ...inputProps, containerSize });

  const makeSvgFillContainer = () => {
    const bounds =
      // @ts-ignore
      d3Container && d3Container.current ? d3Container.current.getBoundingClientRect() : defaultContainerSize;
    if (bounds) {
      setContainerState({ width: bounds.width, height: bounds.height });
    }
  };

  useOnResize(makeSvgFillContainer);

  // Keep d3 in sync with React whenever props change
  useEffect(() => {
    if (!d3Container.current || _.isEqual({ ...inputProps, containerSize }, previousProps)) {
      return;
    }

    // @ts-ignore
    if (previousProps && resizeEvent !== previousProps.resizeEvent) {
      makeSvgFillContainer();
    }

    const container = d3.select(d3Container.current);
    const chart = container.select('svg .chart');
    const width = containerSize.width - margin.left - margin.right;
    const height = containerSize.height - margin.top - margin.bottom;

    d3Draw({
      el: chart,
      container: container,
      width: width,
      height: height,
      histogram,
      scatterPlot,
      timeRange,
      onBinClick
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputProps, previousProps, classes, histogram, timeRange, scatterPlot, resizeEvent, containerSize]);

  // Render
  return (
    <div className={classes.root} ref={d3Container}>
      <svg viewBox={`0 0 ${containerSize.width} ${containerSize.height}`} preserveAspectRatio="xMidYMid meet">
        <g className={`chart ${classes.chartRoot}`} transform={`translate(${margin.left}, ${margin.top})`} />
      </svg>
    </div>
  );
};

type BinPoint = {
  id: string;
  value: Date;
};

type ScatterPoint = BinPoint & {
  kind: string;
  isHighlighted?: boolean;
};

interface IProps {
  resizeEvent: any;
  timeRange: [Date, Date];
  histogram: Array<BinPoint>;
  scatterPlot?: {
    groups: Array<string>;
    data: Array<ScatterPoint>;
  };
  onBinClick?: (bin: Array<{ value: Date; id: string }>) => void;
}

export default observer(TimelineComp);
