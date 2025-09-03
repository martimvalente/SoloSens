// src/pages/DashboardPage.js
import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../auth/AuthProvider';
import axios from '../api/axios';
import QuickStats from '../components/QuickStats';
import LandsMap from '../components/LandsMap';
import LandsTable from '../components/LandsTable';
import ReadingsFeed from '../components/ReadingsFeed';
import AddLandModal from '../components/AddLandModal';
import { useToasts } from '../ui/ToastProvider';

const Wrapper = styled.div`
  max-width: 1200px;
  margin: auto;
  padding: 20px;
`;

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToasts();

  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalCoords, setModalCoords] = useState(null);

  const loadLands = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/v1/lands/');
      setLands(res.data);
    } catch (err) {
      console.error('Failed to load lands', err);
      addToast({ type: 'danger', title: 'Failed to load lands', message: 'Check your permissions or network.' });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadLands();
  }, [loadLands]);

  const handleDeleteLand = async (id) => {
    if (!window.confirm('Are you sure you want to delete this land?')) return;
    try {
      await axios.delete(`/api/v1/lands/${id}/`);
      setLands(prev => prev.filter(land => land.id !== id));
      addToast({ type: 'success', title: 'Land deleted' });
    } catch (error) {
      console.error('Failed to delete land', error);
      addToast({ type: 'danger', title: 'Delete failed', message: 'Could not delete land.' });
    }
  };

  const handleAddLand = (newLand) => {
    setLands(prev => [...prev, newLand]);
    setShowModal(false);
    setModalCoords(null);
    addToast({ type: 'success', title: 'Land added', message: newLand.name });
  };

  const openAddLandModal = () => {
    setModalCoords(null);
    setShowModal(true);
  };

  const handleMapClick = ({ lat, lng }) => {
    // round to 4 decimals as agreed
    setModalCoords({ lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) });
    setShowModal(true);
  };

  return (
    <Wrapper>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0">Welcome, {user?.username}</h1>
        <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 m-0">Your Lands</h2>
        <button className="btn btn-primary" onClick={openAddLandModal}>+ Add Land</button>
      </div>

      {isLoading && (
        <div className="alert alert-info">Loading lands…</div>
      )}

      {!isLoading && lands.length === 0 && (
        <div className="alert alert-warning">No lands yet. Click “+ Add Land” or click the map to create one.</div>
      )}

      <QuickStats lands={lands} />

      {/* Map with clustering; clicking the map opens the Add Land modal with coords */}
      <LandsMap lands={lands} onMapClick={handleMapClick} />

      {/* Table with delete actions */}
      <LandsTable lands={lands} onDelete={handleDeleteLand} />

      {/* Live readings feed (scrollable) */}
      <ReadingsFeed />

      {/* Add Land Modal */}
      {showModal && (
        <AddLandModal
          onClose={() => setShowModal(false)}
          onLandAdded={handleAddLand}
          presetCoords={modalCoords} // seed coords if user clicked map
        />
      )}
    </Wrapper>
  );
};

export default DashboardPage;
