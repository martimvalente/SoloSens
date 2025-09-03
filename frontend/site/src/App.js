// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ToastProvider } from './ui/ToastProvider';   // ✅ add this
import { AuthProvider } from './auth/AuthProvider';   // if you already wrap in index.js, you can remove here
import PrivateRoute from './auth/PrivateRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LandDetailPage from './pages/LandDetailPage';

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/lands/:id"
              element={
                <PrivateRoute>
                  <LandDetailPage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
