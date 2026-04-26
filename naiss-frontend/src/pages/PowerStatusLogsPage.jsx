import React, { useState, useEffect } from 'react';
import { powerStatusLogAPI, substationAPI } from '../api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import { format } from 'date-fns';

function PowerStatusLogsPage() {
  const [logs, setLogs] = useState([]);
  const [substations, setSubstations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [limit] = useState(15);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, subRes] = await Promise.all([
        powerStatusLogAPI.getAll(limit, offset),
        substationAPI.getAll(100, 0)
      ]);
      setLogs(logsRes.data.data);
      setTotal(logsRes.data.total);
      setSubstations(subRes.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch power status logs');
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
      key: 'substation_id', 
      label: 'Substation',
      render: (val) => {
        if (!val) return '-';
        const sub = substations.find(s => s.id === val);
        return sub ? sub.name : 'Unknown';
      }
    },
    { 
      key: 'recorded_at', 
      label: 'Timestamp',
      render: (val) => val ? format(new Date(val), 'MMM dd, yyyy HH:mm:ss') : '-'
    },
    { 
      key: 'power_available', 
      label: 'Status',
      render: (val) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {val ? 'POWER ON' : 'OUTAGE'}
        </span>
      )
    },
    { key: 'voltage', label: 'Voltage (V)', render: val => val !== null ? val : '-' },
    { key: 'current', label: 'Current (A)', render: val => val !== null ? val : '-' },
    { key: 'frequency', label: 'Frequency (Hz)', render: val => val !== null ? val : '-' },
    { key: 'source', label: 'Source', render: val => val || '-' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Power Status Logs</h1>
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

export default PowerStatusLogsPage;
