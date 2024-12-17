import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Layout, Col, Row, Space } from 'antd';
import * as d3 from 'd3';
import ChartTooltip from '../chart-tooltip/chart-tooltip.js';
import DownloadAsPNGButton from '../download-png-btn/download-as-png-btn.js';
import DownloadAsExcelButton from '../download-as-excel-btn/download-as-excel-btn.js';
import { formatFilters } from '../../utils/format-filters.js';

import './line-chart.css';

const LineChart = (props) => {
  const {
    id,
    data,
    xTicksFormatter,
    hasLegend,
    fileName,
    columns,
    filters,
    title,
  } = props;

  const [tooltipTop, setTooltipTop] = useState('auto');
  const [tooltipLeft, setTooltipLeft] = useState('auto');
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipTitle, setTooltipTitle] = useState('');
  const [tooltipValue, setTooltipValue] = useState('');

  const [legend, setLegend] = useState([]);

  const [width, setWidth] = useState(0);

  const colors = ['#2E90FA'],
    margin = { top: 16, right: 0, bottom: 28, left: 58 },
    height =
      window.height < 200
        ? 150 - margin.bottom - margin.top
        : 200 - margin.bottom - margin.top,
    bisect = d3.bisector(function (d) {
      return d.date;
    }).left;

  function initChart() {
    const initalWidth =
      document.getElementById(`chart-${id}`).getBoundingClientRect().width -
      margin.left;
    let svg = d3
      .select(`#chart-${id}`)
      .append('svg')
      .attr('width', initalWidth + margin.left)
      .attr('height', height + margin.bottom + margin.top)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${margin.left}, ${height})`);

    svg
      .append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(0, 0)`);

    svg.append('g').attr('class', 'chart-container');

    svg
      .append('g')
      .attr('class', 'focus')
      .append('circle')
      .attr('stroke', '#fff')
      .attr('r', 7)
      .attr('stroke-width', 8)
      .style('opacity', 0);

    setWidth(initalWidth);
  }

  function updateChart() {
    const svg = d3.select(`#chart-${id} svg g`),
      focus = svg.select('.focus circle'),
      chartContainer = svg.select('.chart-container');

    svg.selectAll('.event-overlay').remove();

    if (hasLegend) {
      setLegend(
        Array.from(data).map((group, i) => {
          return {
            color: colors[i],
            group: group[0],
          };
        })
      );
    }

    const x = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
          return new Date(d.date);
        })
      )
      .range([0, width]);
    svg
      .selectAll('.x-axis')
      .transition()
      .duration(1000)
      .call(
        d3
          .axisBottom(x)
          .tickFormat(xTicksFormatter ? xTicksFormatter : (d) => d)
      );

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function (d) {
          return +d.value;
        }),
      ])
      .range([height, 0]);

    svg
      .selectAll('.y-axis')
      .transition()
      .duration(1000)
      .call(d3.axisLeft(y).tickArguments([3, 's']));

    svg
      .selectAll('.y-axis path, .y-axis line, .x-axis path, .x-axis line')
      .remove();

    svg.selectAll('.tick text').attr('class', 'chart_tick_text');

    const color = d3.scaleOrdinal().range(colors);

    svg.selectAll('.tick text').attr('class', 'chart_tick_text');

    const line = chartContainer.selectAll('.line').data([data], function (d) {
      return d.date;
    });

    function mouseover(e) {
      setTooltipVisible(true);
      focus.style('opacity', 1);
    }

    function mousemove(e) {
      let x0 = x.invert(d3.pointer(e)[0]),
        i = bisect(data, x0, 1),
        selectedData = data[i],
        tooltipXposition = x(selectedData.date),
        tooltipYposition = y(selectedData.value);
      setTooltipTitle(
        selectedData.date.getDate() +
          '/' +
          (selectedData.date.getMonth() + 1) +
          '/' +
          selectedData.date.getFullYear()
      );
      setTooltipValue(selectedData.value);
      focus
        .attr('cx', x(selectedData.date))
        .attr('cy', y(selectedData.value))
        .attr('fill', colors[0]);
      setTooltipTop(tooltipYposition + margin.top + 'px');
      setTooltipLeft(tooltipXposition + margin.left + 'px');
    }

    function mouseleave(d) {
      if (
        d.toElement &&
        typeof d.toElement.className === 'string' &&
        d.toElement.className.includes('chart-tooltip')
      )
        return;
      setTooltipVisible(false);
      focus.style('opacity', 0);
    }

    const lineGenerator = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.value);
      })
      .curve(d3.curveCatmullRom);

    // Updata the line
    line
      .join('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', function (d) {
        return colors[0];
      })
      .attr('stroke-width', 2.17)
      .transition()
      .duration(1000)
      .attr('d', lineGenerator(data));

    svg
      .append('rect')
      .style('fill', 'none')
      .attr('class', 'event-overlay')
      .style('pointer-events', 'all')
      .attr('width', width)
      .attr('height', height)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseleave);
  }

  useEffect(initChart, []);

  useEffect(updateChart, [data]);

  return (
    <div className="chart-wrapper">
      <div className="chart-container" id={`chart-${id}`}>
        <ChartTooltip
          top={tooltipTop}
          left={tooltipLeft}
          title={tooltipTitle}
          visible={tooltipVisible}
          value={tooltipValue}
        />
      </div>
      <div className="download-btns">
        <DownloadAsExcelButton
          data={data}
          columns={columns}
          fileName={fileName}
        />
        <DownloadAsPNGButton
          chartId={`chart-${id}`}
          fileName="line-chart.png"
          metadata={{
            title: title,
            filters: formatFilters(filters),
            downloadDate: new Date().toLocaleDateString(),
            websiteName: 'Zanzibar AI for Tourism',
          }}
        />
      </div>
    </div>
  );
};

LineChart.propTypes = {};

LineChart.defaultProps = {};

export default LineChart;
