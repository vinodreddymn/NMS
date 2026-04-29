import React, { useState, useEffect } from 'react';
import { alarmAPI } from '../api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { format } from 'date-fns';

function AlarmsPage() {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('active');

  const limit = 15;
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  /* ================= FETCH ================= */

  const fetchAlarms = async () => {
    setLoading(true);
    try {
      const response =
        filter === 'active'
          ? await alarmAPI.getActive(limit, offset)
          : await alarmAPI.getHistory(limit, offset);

      setAlarms(response.data.data || []);
      setTotal(response.data.total || 0);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch alarms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, [offset, filter]);

  /* ================= ACTIONS ================= */

  const handleAcknowledge = async (row) => {
    try {
      await alarmAPI.acknowledge(row.id, 'Admin');
      fetchAlarms();
    } catch {
      alert('Failed to acknowledge alarm');
    }
  };

  const handleClear = async (row) => {
    try {
      await alarmAPI.clear(row.id);
      fetchAlarms();
    } catch {
      alert('Failed to clear alarm');
    }
  };

  /* ================= HELPERS ================= */

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'MAJOR': return 'bg-orange-100 text-orange-800';
      case 'MINOR': return 'bg-yellow-100 text-yellow-800';
      case 'INFO': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-red-600';
      case 'ACKNOWLEDGED': return 'text-orange-600';
      case 'CLEARED': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getDuration = (row) => {
    if (row.duration_seconds) {
      return `${Math.floor(row.duration_seconds / 60)} min`;
    }

    // live duration (for active alarms)
    if (row.event_start && row.is_active) {
      const diff = (new Date() - new Date(row.event_start)) / 1000;
      return `${Math.floor(diff / 60)} min`;
    }

    return '-';
  };

  /* ================= COLUMNS ================= */

  const columns = [
    // 🔴 Severity
    {
      key: 'severity',
      label: 'Severity',
      render: (val) => (
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getSeverityColor(val)}`}>
          {val}
        </span>
      )
    },

    // 🧠 Device Info
    {
      key: 'device_name',
      label: 'Device',
      render: (_, row) => row.device_name || row.device_id
    },

    {
      key: 'device_id',
      label: 'Device ID'
    },

    // 📍 Location
    {
      key: 'location',
      label: 'Location',
      render: (_, row) =>
        row.pole_number ||
        row.switch_name ||
        row.substation_name ||
        row.regulator_name ||
        '-'
    },

    // ⚡ Event
    { key: 'event_type', label: 'Event' },

    {
      key: 'message',
      label: 'Message'
    },

    // ⏱ Time
    {
      key: 'event_start',
      label: 'Start Time',
      render: (val) =>
        val ? format(new Date(val), 'MMM dd, yyyy HH:mm:ss') : '-'
    },

    {
      key: 'event_end',
      label: 'End Time',
      render: (val) =>
        val ? format(new Date(val), 'MMM dd, yyyy HH:mm:ss') : '-'
    },

    {
      key: 'duration',
      label: 'Duration',
      render: (_, row) => getDuration(row)
    },

    // 📊 Status
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`font-semibold ${getStatusColor(val)}`}>
          {val}
        </span>
      )
    },

    // 👨‍🔧 Acknowledgement
    {
      key: 'acknowledged',
      label: 'Ack',
      render: (val) => (val ? 'Yes' : 'No')
    },

    {
      key: 'acknowledged_by',
      label: 'Ack By',
      render: (val) => val || '-'
    },

    {
      key: 'acknowledged_at',
      label: 'Ack Time',
      render: (val) =>
        val ? format(new Date(val), 'MMM dd HH:mm:ss') : '-'
    },

    // ⚙️ Metadata
    {
      key: 'source',
      label: 'Source',
      render: (val) => val || '-'
    },

    {
      key: 'remarks',
      label: 'Remarks',
      render: (val) => val || '-'
    },

    // 🔘 Actions
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          {!row.acknowledged && (
            <button
              onClick={() => handleAcknowledge(row)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <FiCheckCircle className="mr-1" /> Ack
            </button>
          )}

          {row.is_active && (
            <button
              onClick={() => handleClear(row)}
              className="text-red-600 hover:text-red-800 text-sm flex items-center"
            >
              <FiXCircle className="mr-1" /> Clear
            </button>
          )}
        </div>
      )
    }
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Alarm Events</h1>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded ${filter === 'active' ? 'bg-white shadow' : ''}`}
            onClick={() => { setFilter('active'); setOffset(0); }}
          >
            Active
          </button>
          <button
            className={`px-4 py-2 rounded ${filter === 'history' ? 'bg-white shadow' : ''}`}
            onClick={() => { setFilter('history'); setOffset(0); }}
          >
            History
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded">
          {error}
        </div>
      )}

      <DataTable columns={columns} data={alarms} loading={loading} />

      {!loading && total > 0 && (
        <Pagination
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={setOffset}
        />
      )}
    </div>
  );
}

export default AlarmsPage;