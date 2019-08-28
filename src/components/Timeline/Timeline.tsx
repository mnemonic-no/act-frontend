import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as _ from 'lodash/fp';
import { ScaleTime } from 'd3';
import { useOnResize, usePrevious } from '../../hooks';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';
import { pluralize } from '../../util/util';
import { observer } from 'mobx-react';
import { compose } from 'recompose';

const defaultContainerSize = { width: 900, height: 200 };
const margin = { top: 20, right: 30, bottom: 30, left: 40 };

const styles = (theme: Theme) =>
  createStyles({
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
        stroke: theme.palette.grey['600'],
        fill: theme.palette.grey['300']
      }
    },
    root: {
      '& .tooltip': {
        fontSize: '0.9rem',
        position: 'absolute',
        borderRadius: '5px',
        zIndex: 9999,
        backgroundColor: theme.palette.grey.A700,
        color: theme.palette.common.white,
        padding: '8px',
        pointerEvents: 'none',
        transition: 'all 0.15s ease',
        opacity: 0
      },
      '& .tooltip h1': {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        margin: 0
      }
    }
  });

const formatMillisecond = d3.timeFormat('.%L'),
  formatSecond = d3.timeFormat(':%S'),
  formatMinute = d3.timeFormat('%H:%M'),
  formatHour = d3.timeFormat('%H'),
  formatDay = d3.timeFormat('%a %d'),
  formatWeek = d3.timeFormat('%b %d'),
  formatMonth = d3.timeFormat('%B'),
  formatYear = d3.timeFormat('%Y');

// Define filter conditions
const multiFormat = (date: Date): string => {
  return (d3.timeSecond(date) < date
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
    : formatYear)(date);
};

const mouseOver = (tooltipEl: any) => {
  return (d: any, i: number, nodes: any) => {
    tooltipEl.style('opacity', 0.9);
    d3.select(nodes[i]).style('opacity', '0.5');
  };
};

const mouseLeave = (tooltipEl: any) => {
  return (d: any, i: number, nodes: any) => {
    tooltipEl.style('opacity', 0);
    d3.select(nodes[i]).style('opacity', '1');
  };
};

const mouseMove = (tooltipEl: any) => {
  return (d: any, i: number, nodes: any) => {
    const targetEl = d3.select(nodes[i]);
    const [x, y] = d3.mouse(targetEl.node());

    const tooltipLeft = _.max([x - margin.left - margin.right, margin.left]);

    tooltipEl.style('top', y - 60 + 'px').style('left', tooltipLeft + 'px');
    tooltipEl.html(
      `<h1>${pluralize(parseInt(targetEl.attr('data-count')), 'fact')}</h1>` +
        `<div>${d3.timeFormat('%Y-%m-%d %H:%M:%S')(new Date(targetEl.attr('data-from')))}</div>` +
        `<div>${d3.timeFormat('%Y-%m-%d %H:%M:%S')(new Date(targetEl.attr('data-to')))}</div>`
    );
  };
};

const xScaleFn = (domain: [Date, Date], range: [number, number]) => {
  return d3
    .scaleTime()
    .domain(domain)
    .nice()
    .range(range);
};

const linearScaleFn = (domain: [number, number], range: [number, number]) => {
  return d3
    .scaleLinear()
    .domain(domain)
    .range(range);
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

  el.select('.yAxis')
    .attr('transform', 'translate(0 0)')
    .call(yAxis);
};

const drawGrid = (el: any, xScale: any, yScale: any, width: number, height: number) => {
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

  const updateY = el.select('.yGrid');
  updateY.call(yAxisGrid);
};

function drawHistogram(
  el: any,
  container: any,
  xScale: ScaleTime<number, number>,
  yScale: any,
  data: Array<{ value: Date }>,
  containerHeight: number
) {
  if (el.select('.histogram').empty()) {
    el.append('g').attr('class', 'histogram');
    container.append('div').attr('class', 'tooltip');
  }

  const update = el
    .select('.histogram')
    .selectAll('rect')
    .data(data, (d: any) => d);

  update
    .enter()
    .append('rect')
    .on('mouseover', mouseOver(container.select('.tooltip')))
    .on('mouseleave', mouseLeave(container.select('.tooltip')))
    .on('mousemove', mouseMove(container.select('.tooltip')))
    .merge(update)
    .attr('x', (d: any) => xScale(d.x0))
    .attr('height', (d: any) => containerHeight - yScale(d.length))
    .attr('data-count', (d: any) => d.length)
    .attr('data-from', (d: any) => d.x0)
    .attr('data-to', (d: any) => d.x1)
    .attr('y', (d: any) => yScale(d.length))
    .attr('width', (d: any) => xScale(d.x1) - xScale(d.x0));

  update.exit().remove();
}

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
  data: Array<{ value: Date }>;
  timeRange: [Date, Date];
}

const d3Draw = ({ el, container, width, height, data, timeRange }: IDrawData) => {
  const xScale = xScaleFn(timeRange, [0, width]);

  const histogram = d3
    .histogram()
    .value((d: any) => d.value)
    // @ts-ignore
    .domain(xScale.domain())
    .thresholds(xScale.ticks(binSize(timeRange)));

  const bins = histogram(data).filter((bin: Array<{ value: Date }>) => bin.length > 0);

  // @ts-ignore
  const maxY: number = d3.max(bins, (x: Array) => x.length);
  const yScale = linearScaleFn([0, maxY === 0 ? 1 : maxY], [height, 0]);

  drawGrid(el, xScale, yScale, width, height);
  drawHistogram(el, container, xScale, yScale, bins, height);
  drawYAxis(el, yScale);
  drawXAxis(el, xScale, height);
};

const TimelineComp = (inputProps: IProps) => {
  const { data, timeRange, classes, resizeEvent } = inputProps;

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

    d3Draw({ el: chart, container: container, width: width, height: height, data, timeRange });
  }, [inputProps, previousProps, classes, data, timeRange, resizeEvent, containerSize]);

  // Render
  return (
    <div style={{ width: '100%', height: '200px', position: 'relative' }} className={classes.root} ref={d3Container}>
      <svg viewBox={`0 0 ${containerSize.width} ${containerSize.height}`} preserveAspectRatio="xMidYMid meet">
        <g className={`chart ${classes.chartRoot}`} transform={`translate(${margin.left}, ${margin.top})`} />
      </svg>
    </div>
  );
};

interface IProps extends WithStyles<typeof styles> {
  resizeEvent: any;
  timeRange: [Date, Date];
  data: Array<{ value: Date }>;
}

export default compose<IProps, Omit<IProps, 'classes'>>(
  withStyles(styles),
  observer
)(TimelineComp);
