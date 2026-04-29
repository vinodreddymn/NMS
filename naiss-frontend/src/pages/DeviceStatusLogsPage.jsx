import React, { useState, useEffect, useMemo } from 'react';
import { deviceStatusLogAPI, deviceAPI } from '../api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import { format } from 'date-fns';

/* -------------------- UI Components -------------------- */

const StatusBadge = ({ status }) => {
  const isUp = Boolean(status);

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
      isUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {isUp ? 'UP' : 'DOWN'}
    </span>
  );
};

const TransitionBadge = ({ previous, current }) => {
  if (previous === null || previous === current) {
    return <span className="text-gray-400">-</span>;
  }

  const isUp = Boolean(current);

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
      isUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {`${previous ? 'UP' : 'DOWN'} → ${current ? 'UP' : 'DOWN'}`}
    </span>
  );
};

/* -------------------- Main Component -------------------- */

function DeviceStatusLogsPage() {
  const [logs, setLogs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const limit = 15;
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  /* -------------------- Device Map -------------------- */

  const deviceMap = useMemo(() => {
    const map = new Map();
    devices.forEach(d => map.set(d.id, d.device_name));
    return map;
  }, [devices]);

  const getDeviceName = (id) => deviceMap.get(id) || 'Unknown';

  /* -------------------- Fetch ONLY Status Changes -------------------- */

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [logsRes, devicesRes] = await Promise.all([
        deviceStatusLogAPI.getStatusChanges(limit, offset), // ✅ ONLY THIS
        deviceAPI.getAll(100, 0),
      ]);

      setLogs(logsRes?.data?.data || []);
      setTotal(logsRes?.data?.total || 0);
      setDevices(devicesRes?.data?.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load status change events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [offset]);

  /* -------------------- Columns -------------------- */

  const columns = [
    {
      key: 'device_id',
      label: 'Device',
      render: (val) => getDeviceName(val),
    },
    {
      key: 'checked_at',
      label: 'Event Time',
      render: (val) =>
        val ? format(new Date(val), 'MMM dd, yyyy HH:mm:ss') : '-',
    },
    {
      key: 'current_status',
      label: 'Transition',
      render: (_, row) => (
        <TransitionBadge
          previous={row.previous_status}
          current={row.current_status}
        />
      ),
    },
    {
      key: 'snmp_status',
      label: 'SNMP',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'response_time_ms',
      label: 'Response (ms)',
      render: (v) => v ?? '-',
    },
    {
      key: 'packet_loss',
      label: 'Packet Loss (%)',
      render: (v) => v ?? '-',
    },
    {
      key: 'temperature',
      label: 'Temp (°C)',
      render: (v) => v ?? '-',
    },
  ];

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">
        Device Status Events
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {!loading && logs.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
          <p className="text-blue-800 font-medium">
            No status change events yet
          </p>
          <p className="text-blue-600 text-sm">
            Events will appear when devices go UP or DOWN
          </p>
        </div>
      )}

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
          onPageChange={setOffset}
        />
      )}
    </div>
  );
}

export default DeviceStatusLogsPage;