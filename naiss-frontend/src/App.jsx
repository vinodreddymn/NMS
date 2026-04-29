import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import DeviceTypesPage from './pages/DeviceTypesPage';
import DevicesPage from './pages/DevicesPage';
import PolesPage from './pages/PolesPage';
import SwitchesPage from './pages/SwitchesPage';
import SubstationsPage from './pages/SubstationsPage';
import RegulatorsPage from './pages/RegulatorsPage';
import AlarmsPage from './pages/AlarmsPage';
import DeviceStatusLogsPage from './pages/DeviceStatusLogsPage';
import PowerStatusLogsPage from './pages/PowerStatusLogsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/device-types" element={<DeviceTypesPage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/poles" element={<PolesPage />} />
            <Route path="/switches" element={<SwitchesPage />} />
            <Route path="/substations" element={<SubstationsPage />} />
            <Route path="/regulators" element={<RegulatorsPage />} />
            <Route path="/alarms" element={<AlarmsPage />} />
            <Route path="/device-logs" element={<DeviceStatusLogsPage />} />
            <Route path="/power-logs" element={<PowerStatusLogsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
