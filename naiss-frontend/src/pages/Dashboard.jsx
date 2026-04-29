import React, { useState, useEffect } from 'react';
import { deviceAPI, alarmAPI, powerStatusLogAPI } from '../api';
import { FiServer, FiAlertTriangle, FiZapOff, FiActivity } from 'react-icons/fi';

function Dashboard() {
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeAlarms: 0,
    recentOutages: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [devicesRes, alarmsRes, outagesRes] = await Promise.all([
          deviceAPI.getAll(1, 0),
          alarmAPI.getActive(1, 0),
          powerStatusLogAPI.getOutages(1, 0)
        ]);

        setStats({
          totalDevices: devicesRes.data.total || 0,
          activeAlarms: alarmsRes.data.total || 0,
          recentOutages: outagesRes.data.total || 0,
          loading: false,
          error: null
        });
      } catch (err) {
        setStats(prev => ({ ...prev, loading: false, error: 'Failed to load dashboard data.' }));
      }
    };

    fetchDashboardData();
  }, []);

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="loading"></div>
        <span className="ml-3 text-gray-600">Loading Dashboard...</span>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Devices', value: stats.totalDevices, icon: FiServer, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Active Alarms', value: stats.activeAlarms, icon: FiAlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    { title: 'Recent Outages', value: stats.recentOutages, icon: FiZapOff, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { title: 'System Status', value: stats.activeAlarms > 0 ? 'Degraded' : 'Healthy', icon: FiActivity, color: stats.activeAlarms > 0 ? 'text-orange-600' : 'text-green-600', bg: stats.activeAlarms > 0 ? 'bg-orange-100' : 'bg-green-100' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
      
      {stats.error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-red-700 break-words">{stats.error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
            <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${card.bg}`}>
              <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider truncate">{card.title}</h2>
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mt-0.5 sm:mt-1 truncate">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
