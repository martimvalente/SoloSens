// src/components/QuickStats.js
import React from 'react';
import styled from 'styled-components';
import axios from '../api/axios';


const Grid = styled.div`
  display: flex;
  gap: 20px;
  margin: 20px 0;
`;

const StatBox = styled.div`
  background: #f4f4f4;
  padding: 20px;
  border-radius: 8px;
  flex: 1;
  text-align: center;
`;

const QuickStats = ({ lands }) => {
  const activeLands = lands.filter(l => l.active).length;

  return (
    <Grid>
      <StatBox>
        <h3>Total Lands</h3>
        <p>{lands.length}</p>
      </StatBox>
      <StatBox>
        <h3>Active Lands</h3>
        <p>{activeLands}</p>
      </StatBox>
      <StatBox>
        <h3>Unique Locations</h3>
        <p>{new Set(lands.map(l => `${l.latitude},${l.longitude}`)).size}</p>
      </StatBox>
    </Grid>
  );
};

export default QuickStats;
