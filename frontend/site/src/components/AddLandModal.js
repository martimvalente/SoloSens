// src/components/AddLandModal.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from '../api/axios';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
`;

const Modal = styled.div`
  background: #fff;
  max-width: 560px;
  width: 100%;
  padding: 1.5rem;
  border-radius: 8px;
`;

const MapWrap = styled.div`
  height: 280px;
  margin: 1rem 0;
`;

const ESTARREJA_CENTER = { lat: 40.7560, lng: -8.5720 };
const round4 = (n) => Number(Number(n).toFixed(4));
const isNum = (v) => Number.isFinite(Number(v));

// Fix Leaflet sizing when inside a modal
const MapInitializer = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        map.invalidateSize();
        const [lat, lng] = center;
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          map.setView(center);
        }
      } catch {}
    }, 0);
    return () => clearTimeout(id);
  }, [map, center]);
  return null;
};

const LocationPicker = ({ onPick }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPick({ lat, lng });
    },
  });
  return null;
};

/**
 * Props:
 *  - onClose()
 *  - onLandAdded(newLand)
 *  - presetCoords?: { lat, lng }
 */
const AddLandModal = ({ onClose, onLandAdded, presetCoords = null }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    latitude: presetCoords?.lat ?? null,
    longitude: presetCoords?.lng ?? null,
  });

  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMapReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const [accountId, setAccountId] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Resolve account_id from /api/v1/me/
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await axios.get('/api/v1/me/');
        if (!ignore) {
          const acct = res?.data?.account_id || null;
          setAccountId(acct);
        }
      } catch (e) {
        console.error('Failed to load account id for land creation', e);
        if (!ignore) setError('Could not load account info. Please try again.');
      } finally {
        if (!ignore) setLoadingAccount(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      const n = Number(value);
      setForm((p) => ({ ...p, [name]: isNum(n) ? n : null }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const onMapPick = ({ lat, lng }) => {
    setForm((p) => ({
      ...p,
      latitude: round4(lat),
      longitude: round4(lng),
    }));
  };

  const onBlurRound = (e) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      const n = Number(value);
      if (isNum(n)) setForm((p) => ({ ...p, [name]: round4(n) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, description, latitude, longitude } = form;

    if (!name.trim()) return setError('Name is required.');
    if (!isNum(latitude) || !isNum(longitude))
      return setError('Please provide valid latitude and longitude.');
    if (!accountId) return setError('Account not resolved yet.');

    const payload = {
      name: name.trim(),
      description: description?.trim() || '',
      latitude: round4(latitude),
      longitude: round4(longitude),
      account: accountId, // required by your API
    };

    try {
      setSaving(true);
      let res;
      try {
        res = await axios.post('/api/v1/lands/', payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        if (err?.response?.status === 405) {
          res = await axios.post('/api/v1/lands', payload, {
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          throw err;
        }
      }
      onLandAdded(res.data);
      onClose();
    } catch (err) {
      console.error('Failed to add land', err);
      const serverMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        JSON.stringify(err?.response?.data || {});
      setError(`Failed to add land: ${serverMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const mapCenter = [
    isNum(form.latitude) ? Number(form.latitude) : ESTARREJA_CENTER.lat,
    isNum(form.longitude) ? Number(form.longitude) : ESTARREJA_CENTER.lng,
  ];

  return (
    <Backdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <h5 className="mb-3">Add Land</h5>

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label">Name</label>
            <input
              name="name"
              className="form-control"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              value={form.description}
              onChange={onChange}
              rows={2}
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Latitude</label>
            <input
              name="latitude"
              type="number"
              step="0.0001"
              className="form-control"
              value={isNum(form.latitude) ? form.latitude : ''}
              onChange={onChange}
              onBlur={onBlurRound}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Longitude</label>
            <input
              name="longitude"
              type="number"
              step="0.0001"
              className="form-control"
              value={isNum(form.longitude) ? form.longitude : ''}
              onChange={onChange}
              onBlur={onBlurRound}
              required
            />
          </div>

          {mapReady && (
            <MapWrap>
              <MapContainer
                center={mapCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                key={`${mapCenter[0]},${mapCenter[1]}`}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapInitializer center={mapCenter} />
                <LocationPicker onPick={onMapPick} />
                {isNum(form.latitude) && isNum(form.longitude) && (
                  <Marker position={[Number(form.latitude), Number(form.longitude)]} />
                )}
              </MapContainer>
            </MapWrap>
          )}

          {loadingAccount && (
            <div className="alert alert-warning py-2">Resolving account…</div>
          )}
          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="d-flex justify-content-end mt-3">
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || loadingAccount || !accountId}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </Backdrop>
  );
};

export default AddLandModal;
