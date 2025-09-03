// src/components/ReadingsFeed.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from '../api/axios';

const FeedWrapper = styled.div`
  margin-top: 30px;
`;

const FeedTitle = styled.h3`
  margin-bottom: 10px;
`;

const FeedContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  background-color: #fafafa;
`;

const FeedItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const ReadingsFeed = () => {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const res = await axios.get('/api/v1/readings/feed/');
        setReadings(res.data);
      } catch (err) {
        console.error('Failed to fetch readings feed:', err);
      }
    };

    fetchReadings(); // initial load
    const interval = setInterval(fetchReadings, 5000); // refresh every 5s
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <FeedWrapper>
      <FeedTitle>🔄 Live Readings Feed</FeedTitle>
      <FeedContainer>
        {readings.length === 0 ? (
          <p>No readings yet...</p>
        ) : (
          readings.map((reading) => (
            <FeedItem key={reading.id}>
              <strong>Terra: {reading.id || 'Unknown Land'}</strong><br />
              Temperatura Solo: {reading.soil_temperature}<br />
              Temperatura Ar: {reading.air_temperature}<br />
              Humidade Solo: {reading.soil_humidity}<br />
              Humidade Ar: {reading.air_humidity}<br />
              At: {new Date(reading.timestamp).toLocaleString()}
            </FeedItem>
          ))
        )}
      </FeedContainer>
    </FeedWrapper>
  );
};

export default ReadingsFeed;
