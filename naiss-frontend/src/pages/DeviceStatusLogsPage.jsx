import React, { useState, useEffect } from 'react';
import { deviceStatusLogAPI, deviceAPI } from '../api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import { format } from 'date-fns';

function DeviceStatusLogsPage() {
  const [logs, setLogs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [limit] = useState(15);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, devicesRes] = await Promise.all([
        deviceStatusLogAPI.getAll(limit, offset),
        deviceAPI.getAll(100, 0) // Pre-fetch devices for mapping names
      ]);
      setLogs(logsRes.data.data);
      setTotal(logsRes.data.total);
      setDevices(devicesRes.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch device status logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [offset]);

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
  };

  const columns = [
    { 
      key: 'device_id', 
      label: 'Device',
      render: (val) => {
        const device = devices.find(d => d.id === val);
        return device ? device.device_name : 'Unknown';
      }
    },
    { 
      key: 'checked_at', 
      label: 'Timestamp',
      render: (val) => val ? format(new Date(val), 'MMM dd, yyyy HH:mm:ss') : '-'
    },
    { 
      key: 'ping_status', 
      label: 'Ping',
      render: (val) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {val ? 'UP' : 'DOWN'}
        </span>
      )
    },
    { key: 'response_time_ms', label: 'Response (ms)', render: val => val ? `${val} ms` : '-' },
    { key: 'packet_loss', label: 'Packet Loss (%)', render: val => val !== null ? `${val}%` : '-' },
    { key: 'cpu_usage', label: 'CPU (%)', render: val => val !== null ? `${val}%` : '-' },
    { key: 'memory_usage', label: 'Memory (%)', render: val => val !== null ? `${val}%` : '-' },
    { key: 'temperature', label: 'Temp (°C)', render: val => val !== null ? `${val}°C` : '-' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Device Status Logs</h1>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}

      <DataTable
        columns={columns}
        data={logs}
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

export default DeviceStatusLogsPage;
