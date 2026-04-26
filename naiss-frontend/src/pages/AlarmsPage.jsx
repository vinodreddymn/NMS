import React, { useState, useEffect } from 'react';
import { alarmAPI } from '../api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import { FiCheckCircle } from 'react-icons/fi';
import { format } from 'date-fns';

function AlarmsPage() {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('active'); // 'active' or 'all'
  
  const [limit] = useState(15);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchAlarms = async () => {
    setLoading(true);
    try {
      const response = filter === 'active' 
        ? await alarmAPI.getActive(limit, offset)
        : await alarmAPI.getAll(limit, offset);
      
      setAlarms(response.data.data);
      setTotal(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch alarms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, [offset, filter]);

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
  };

  const handleAcknowledge = async (row) => {
    try {
      await alarmAPI.acknowledge(row.id, 'Admin User'); // Hardcoded user for now
      fetchAlarms();
    } catch (err) {
      alert('Failed to acknowledge alarm');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'MAJOR': return 'bg-orange-100 text-orange-800';
      case 'MINOR': return 'bg-yellow-100 text-yellow-800';
      case 'INFO': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    { 
      key: 'severity', 
      label: 'Severity',
      render: (val) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getSeverityColor(val)}`}>
          {val}
        </span>
      )
    },
    { key: 'event_type', label: 'Event Type' },
    { key: 'message', label: 'Message' },
    { 
      key: 'event_start', 
      label: 'Start Time',
      render: (val) => val ? format(new Date(val), 'MMM dd, yyyy HH:mm:ss') : '-'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <span className={`font-semibold ${val === 'ACTIVE' ? 'text-red-600' : 'text-green-600'}`}>
          {val}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        !row.acknowledged && (
          <button
            onClick={() => handleAcknowledge(row)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <FiCheckCircle className="mr-1" /> Ack
          </button>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Alarms</h1>
        
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'active' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setFilter('active'); setOffset(0); }}
          >
            Active Alarms
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setFilter('all'); setOffset(0); }}
          >
            All History
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}

      <DataTable
        columns={columns}
        data={alarms}
        loading={loading}
      />

      {!loading && total > 0 && (
        <Pagination
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default AlarmsPage;
