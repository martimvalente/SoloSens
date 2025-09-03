// src/pages/LandDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import styled from 'styled-components';
import AddStakeModal from '../components/AddStakeModal';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useToasts } from '../ui/ToastProvider';

const Wrapper = styled.div`
  max-width: 1000px;
  margin: auto;
  padding: 20px;
`;

const MapWrapper = styled.div`
  height: 500px;
  margin-top: 20px;
`;

const blueMarkerIcon = new L.Icon({
  iconUrl: '/icons/marker-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const redMarkerIcon = new L.Icon({
  iconUrl: '/icons/marker-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const greenMarkerIcon = new L.Icon({
  iconUrl: '/icons/marker-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const OW_BASE = 'https://api.openweathermap.org';

// proxy helper: AllOrigins /get returns JSON with { contents: "<string>" }
async function proxiedGetJSON(fullUrl) {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`;
  const res = await fetch(proxyUrl, { method: 'GET', credentials: 'omit' });
  if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.contents);
}

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// render guard to avoid NaN warnings
const safe = (n) => (Number.isFinite(n) ? n : null);

const LandDetailPage = () => {
  const { addToast } = useToasts(); // ✅ Hook called inside component
  const { id: landId } = useParams();
  const navigate = useNavigate();

  const [land, setLand] = useState(null);
  const [stakes, setStakes] = useState([]);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);

  const [weather, setWeather] = useState(null);
  const [nearestPlace, setNearestPlace] = useState(null);

  // Fetch land + stakes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const landRes = await axios.get(`/api/v1/lands/${landId}/`);
        setLand(landRes.data);

        const stakesRes = await axios.get(`/api/v1/lands/${landId}/stakes/`);
        const stakesWithDetails = await Promise.all(
          stakesRes.data.map(async (stake) => {
            const readingsRes = await axios.get(`/api/v1/stakes/${stake.id}/readings/`);
            const readings = readingsRes.data;

            let lastReading = null;
            let isActive = false;
            let avg = null;

            if (Array.isArray(readings) && readings.length > 0) {
              readings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
              lastReading = readings[0];
              const now = new Date();
              const lastTime = new Date(lastReading.timestamp);
              isActive = now - lastTime <= 24 * 60 * 60 * 1000;

              // If your reading shape differs, adjust avg accordingly or remove it
              const values = readings.map((r) => Number(r.value)).filter(Number.isFinite);
              if (values.length) {
                const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;
                avg = Math.round(avgValue * 100) / 100;
              }
            }

            return {
              ...stake,
              latestReading: null,
              loading: false,
              readings,
              lastReading,
              avg,
              isActive,
            };
          })
        );
        setStakes(stakesWithDetails);
      } catch (err) {
        console.error('Failed to fetch land or stakes', err);
        navigate('/dashboard');
      }
    };

    fetchData();
  }, [landId, navigate]);

  // Fetch nearest weather (frontend only with CORS-safe proxy)
  const fetchWeather = async () => {
    if (!land) return;
    try {
      const key = process.env.REACT_APP_OPENWEATHER_API_KEY;

      // 1) Find nearest OW location
      const findUrl = `${OW_BASE}/data/2.5/find?${new URLSearchParams({
        lat: String(land.latitude),
        lon: String(land.longitude),
        cnt: '1',
        units: 'metric',
        appid: key,
      }).toString()}`;

      const find = await proxiedGetJSON(findUrl);
      const nearest = find?.list?.[0];

      if (!nearest) {
        // fallback: direct weather on land coords
        const fallbackUrl = `${OW_BASE}/data/2.5/weather?${new URLSearchParams({
          lat: String(land.latitude),
          lon: String(land.longitude),
          units: 'metric',
          appid: key,
        }).toString()}`;
        const w = await proxiedGetJSON(fallbackUrl);
        setNearestPlace(null);
        setWeather(w);
        return;
      }

      // 2) Pull full weather by city id
      const byIdUrl = `${OW_BASE}/data/2.5/weather?${new URLSearchParams({
        id: String(nearest.id),
        units: 'metric',
        appid: key,
      }).toString()}`;
      const w = await proxiedGetJSON(byIdUrl);

      const distKm = haversineKm(
        Number(land.latitude),
        Number(land.longitude),
        nearest.coord.lat,
        nearest.coord.lon
      );

      setNearestPlace({
        id: nearest.id,
        name: nearest.name,
        country: nearest.sys?.country || '',
        distanceKm: Number.isFinite(distKm) ? Number(distKm.toFixed(1)) : null,
      });
      setWeather(w);
    } catch (err) {
      console.error('Failed to fetch nearest weather', err);
    }
  };

  useEffect(() => {
    if (land) fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [land]);

  const handleDeleteStake = async (stakeId) => {
    if (!window.confirm('Are you sure you want to delete this stake?')) return;
    try {
      await axios.delete(`/api/v1/stakes/${stakeId}/`);
      setStakes((prev) => prev.filter((s) => s.id !== stakeId));
      addToast({ type: 'success', title: 'Stake deleted' });
    } catch (err) {
      console.error('Failed to delete stake', err);
      addToast({ type: 'danger', title: 'Delete failed', message: 'Could not delete stake.' });
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setSelectedCoords(e.latlng);
        setShowStakeModal(true);
      },
    });
    return null;
  };

  if (!land) return <Wrapper>Loading...</Wrapper>;

  const center = [parseFloat(land.latitude), parseFloat(land.longitude)];

  return (
    <Wrapper>
      <nav>
        <ul>
          <li onClick={() => navigate('/dashboard')}>
            <strong>← Back to Dashboard</strong>
          </li>
        </ul>
      </nav>

      <h2>{land.name}</h2>
      <p>
        <strong>Description:</strong> {land.description}
      </p>
      <p>
        <strong>Coordinates:</strong> {land.latitude}, {land.longitude}
      </p>

      {/* Main Map */}
      <MapWrapper>
        <MapContainer center={center} zoom={15} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler />

          <Marker position={center} icon={blueMarkerIcon}>
            <Popup>
              <strong>{land.name}</strong>
              <br />
              {land.description}
            </Popup>
          </Marker>

          {stakes.map((stake, i) => (
            <Marker
              key={stake.id}
              position={[parseFloat(stake.latitude), parseFloat(stake.longitude)]}
              icon={stake.isActive ? greenMarkerIcon : redMarkerIcon}
              eventHandlers={{
                popupopen: async () => {
                  if (!stake.latestReading && !stake.loading) {
                    try {
                      setStakes((prev) => {
                        const updated = [...prev];
                        updated[i] = { ...stake, loading: true };
                        return updated;
                      });
                      const res = await axios.get(`/api/v1/stakes/${stake.id}/latest-reading/`);
                      const reading = res.data;
                      setStakes((prev) => {
                        const updated = [...prev];
                        updated[i] = { ...stake, latestReading: reading, loading: false };
                        return updated;
                      });
                    } catch (err) {
                      console.error(`Failed to fetch latest reading for stake ${stake.id}`);
                    }
                  }
                },
              }}
            >
              <Popup>
                <strong>{stake.name}</strong>
                <br />
                Installed: {new Date(stake.installed_at).toLocaleString()}
                <br />
                {stake.latestReading ? (
                  <>
                    Temperatura Solo: {safe(Number(stake.latestReading.soil_temperature)) ?? '—'}°C
                    <br />
                    Temperatura Ar: {safe(Number(stake.latestReading.air_temperature)) ?? '—'}°C
                    <br />
                    Humidade Solo: {safe(Number(stake.latestReading.soil_humidity)) ?? '—'}%
                    <br />
                    Humidade Ar: {safe(Number(stake.latestReading.air_humidity)) ?? '—'}%
                    <br />
                    At:{' '}
                    {stake.latestReading.timestamp
                      ? new Date(stake.latestReading.timestamp).toLocaleString()
                      : '—'}
                  </>
                ) : stake.loading ? (
                  <>Loading reading...</>
                ) : (
                  <>No reading available</>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </MapWrapper>

      {/* Stakes Table */}
      <h3 className="mt-4">Stakes</h3>
      <button className="btn btn-primary mb-3" onClick={() => setShowStakeModal(true)}>
        + Add Stake
      </button>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Status</th>
            <th>Last Reading</th>
            <th>Avg Reading</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stakes.map((stake) => {
            const hasReadings = Array.isArray(stake.readings) && stake.readings.length > 0;
            const badgeClass = hasReadings ? (stake.isActive ? 'success' : 'danger') : 'secondary';
            const lastTime = hasReadings ? new Date(stake.lastReading?.timestamp) : null;
            return (
              <tr key={stake.id}>
                <td>{stake.name}</td>
                <td>{Number.isFinite(Number(stake.latitude)) ? Number(stake.latitude).toFixed(4) : '—'}</td>
                <td>{Number.isFinite(Number(stake.longitude)) ? Number(stake.longitude).toFixed(4) : '—'}</td>
                <td>
                  <span className={`badge bg-${badgeClass}`}>
                    {hasReadings ? (stake.isActive ? 'Active ≤24h' : 'Inactive >24h') : 'No readings'}
                  </span>
                </td>
                <td>{lastTime ? lastTime.toLocaleString() : '—'}</td>
                <td>{Number.isFinite(stake.avg) ? stake.avg : '—'}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteStake(stake.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

          <h3 className="mt-4">Dados Meterológicos Globais</h3>
      {/* Add Stake Modal */}
      {showStakeModal && (
        <AddStakeModal
          landId={landId}
          presetCoords={selectedCoords}
          onClose={() => setShowStakeModal(false)}
          onStakeAdded={(newStake) => {
            setStakes((prev) => [...prev, { ...newStake, isActive: false }]);
            addToast({ type: 'success', title: 'Stake added', message: `${newStake.name} created.` });
          }}
        />
      )}

      {/* Weather Card */}
      {weather && (
        <div className="card my-3">
          <div className="card-body">
            <h5 className="card-title">🌤️ Current Weather</h5>
            <p className="card-text">
              <strong>
                {nearestPlace
                  ? `${nearestPlace.name}${
                      nearestPlace.country ? ', ' + nearestPlace.country : ''
                    }${
                      Number.isFinite(nearestPlace.distanceKm)
                        ? ` (${nearestPlace.distanceKm} km from land)`
                        : ''
                    }`
                  : weather.name || '—'}
              </strong>
              <br />
              <strong>Temperature:</strong> {safe(Number(weather.main?.temp)) ?? '—'}°C
              <br />
              <strong>Feels Like:</strong> {safe(Number(weather.main?.feels_like)) ?? '—'}°C
              <br />
              <strong>Humidity:</strong> {safe(Number(weather.main?.humidity)) ?? '—'}%
              <br />
              <strong>Pressure:</strong> {safe(Number(weather.main?.pressure)) ?? '—'} hPa
              <br />
              <strong>Wind:</strong> {safe(Number(weather.wind?.speed)) ?? '—'} m/s
              <br />
              <strong>Condition:</strong>{' '}
              {weather.weather?.[0]?.main
                ? `${weather.weather[0].main} (${weather.weather[0].description})`
                : '—'}
              <br />
              {weather.sys?.sunrise && (
                <>
                  <strong>Sunrise:</strong>{' '}
                  {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}
                  <br />
                  <strong>Sunset:</strong>{' '}
                  {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <h3 className="mt-4">Cultivo atual da propriedade</h3>
    </Wrapper>
  );
};

export default LandDetailPage;
