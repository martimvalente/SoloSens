// src/components/AddStakeModal.js
import React, { useState } from 'react';
import styled from 'styled-components';
import axios from '../api/axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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
  max-width: 520px;
  width: 100%;
  padding: 1.5rem;
  border-radius: 8px;
`;
const MapWrap = styled.div`
  height: 250px;
  margin: 1rem 0;
`;

const LocationPicker = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
};

const AddStakeModal = ({ landId, onClose, onStakeAdded, presetCoords }) => {
  const [form, setForm] = useState({
    name: '',
    latitude: presetCoords?.lat ?? '',
    longitude: presetCoords?.lng ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onMapPick = ({ lat, lng }) => {
    // limit to 4 decimals as requested
    setForm((p) => ({
      ...p,
      latitude: Number(lat).toFixed(4),
      longitude: Number(lng).toFixed(4),
    }));
  };

  const onBlurRound = (e) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      const n = Number(value);
      if (!Number.isNaN(n)) {
        setForm((p) => ({ ...p, [name]: n.toFixed(4) }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || form.latitude === '' || form.longitude === '') {
      setError('Please fill name, latitude and longitude.');
      return;
    }
    setSaving(true);
    try {
      // ✅ Create goes to /api/v1/stakes/
      const payload = {
        name: form.name.trim(),
        latitude: String(Number(form.latitude).toFixed(4)),
        longitude: String(Number(form.longitude).toFixed(4)),
        land: landId, // backend expects "land" field
      };
      const res = await axios.post('/api/v1/stakes/', payload);
      onStakeAdded(res.data);
      onClose();
    } catch (err) {
      console.error('Failed to add stake', err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          'Failed to add stake.'
      );
    } finally {
      setSaving(false);
    }
  };

  const mapCenter = [
    form.latitude ? Number(form.latitude) : 40.7,
    form.longitude ? Number(form.longitude) : -8.6,
  ];

  return (
    <Backdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <h5 className="mb-3">Add Stake</h5>
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
            <label className="form-label">Latitude</label>
            <input
              name="latitude"
              type="number"
              step="any"
              className="form-control"
              value={form.latitude}
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
              step="any"
              className="form-control"
              value={form.longitude}
              onChange={onChange}
              onBlur={onBlurRound}
              required
            />
          </div>

          <MapWrap>
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker onPick={onMapPick} />
              {form.latitude !== '' && form.longitude !== '' && (
                <Marker position={[Number(form.latitude), Number(form.longitude)]} />
              )}
            </MapContainer>
          </MapWrap>

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
            <button type="submit" className="btn btn-success" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </Backdrop>
  );
};

export default AddStakeModal;