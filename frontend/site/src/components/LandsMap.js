// src/components/LandsMap.js
import React from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const Wrapper = styled.div`
  height: 400px;
  margin: 30px 0;
`;

const blueMarkerIcon = new L.Icon({
  iconUrl: '/icons/marker-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        const { lat, lng } = e.latlng;
        onMapClick({ lat, lng });
      }
    },
  });
  return null;
};

const LandsMap = ({ lands, onMapClick }) => {
  const navigate = useNavigate();

  if (!lands || lands.length === 0) {
    return <Wrapper><p className="text-muted m-0">No lands to display</p></Wrapper>;
  }

  const center = [
    parseFloat(lands[0].latitude),
    parseFloat(lands[0].longitude),
  ];

  return (
    <Wrapper>
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onMapClick={onMapClick} />

        {lands.map((land) => (
          <Marker
            key={land.id}
            position={[parseFloat(land.latitude), parseFloat(land.longitude)]}
            icon={blueMarkerIcon}
            eventHandlers={{ click: () => navigate(`/lands/${land.id}`) }}
          >
            <Popup>
              <strong>{land.name}</strong><br />
              {land.description || 'No description'}
              <br />
              <em>Click pin to open</em>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Wrapper>
  );
};

export default LandsMap;
