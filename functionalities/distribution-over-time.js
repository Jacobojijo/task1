import React, { useState, useEffect } from 'react';
import Section from '../section/section';
import LineChart from '../line-chart/line-chart';
import ChartCard from '../chart-card/chart-card';
import EstablishmentTypeToggle from '../establishment-type-toggle/establishment-type-toggle';
import reviewData from '../../assets/reviewdata.json';
import './distribution-over-time.css';

const DistributionOverTime = () => {
  const [visitsOverTime, setVisitsOverTime] = useState([]);

  useEffect(() => {
    const computeVisitsOverTime = () => {
      const visitsOverTime = reviewData.map((review) => {
        return {
          date: new Date(review.date),
          value: review.value,
        };
      });
      return visitsOverTime.sort((a, b) => a.date - b.date);
    };
    setVisitsOverTime(computeVisitsOverTime());
  }, []);

  function xTicksFormatter(value) {
    const options = { year: 'numeric', month: 'short' };
    return value.toLocaleString('en-US', options);
  }

  const appliedFilters = {};

  return (
    <Section title={<span>Number of reviews over time</span>}>
      <EstablishmentTypeToggle />
      <ChartCard>
        <LineChart
          id="number-of-visits"
          data={visitsOverTime}
          xTicksFormatter={xTicksFormatter}
          columns={{ date: 'Date', value: 'Value' }}
          fileName="reviews-over-time"
          filters={appliedFilters}
          title={'Number of reviews over time'}
        />
      </ChartCard>
    </Section>
  );
};

export default DistributionOverTime;
