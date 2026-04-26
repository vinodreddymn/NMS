import React, { useState, useEffect } from 'react';
import { regulatorAPI, substationAPI } from '../api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

function RegulatorsPage() {
  const [regulators, setRegulators] = useState([]);
  const [substations, setSubstations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  
  const initialFormState = {
    name: '',
    substation_id: '',
    input_voltage: '',
    output_voltage: '',
    capacity_kva: '',
    status: true
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regRes, subRes] = await Promise.all([
        regulatorAPI.getAll(limit, offset),
        substationAPI.getAll(100, 0)
      ]);
      setRegulators(regRes.data.data);
      setTotal(regRes.data.total);
      setSubstations(subRes.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch voltage regulators');
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

  const handleAdd = () => {
    setModalMode('add');
    setFormData(initialFormState);
    setSelectedId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setModalMode('edit');
    setFormData({
      name: row.name || '',
      substation_id: row.substation_id || '',
      input_voltage: row.input_voltage || '',
      output_voltage: row.output_voltage || '',
      capacity_kva: row.capacity_kva || '',
      status: row.status !== false
    });
    setSelectedId(row.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to delete regulator ${row.name}?`)) {
      try {
        await regulatorAPI.delete(row.id);
        fetchData();
      } catch (err) {
        alert('Failed to delete regulator');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.substation_id) {
      alert('Name and Substation are required');
      return;
    }

    const payload = { ...formData };

    setFormLoading(true);
    try {
      if (modalMode === 'add') {
        await regulatorAPI.create(payload);
      } else {
        await regulatorAPI.update(selectedId, payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Failed to ${modalMode} regulator: ${err.response?.data?.error || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { 
      key: 'substation_id', 
      label: 'Substation',
      render: (val) => {
        const sub = substations.find(s => s.id === val);
        return sub ? sub.name : 'Unknown';
      }
    },
    { key: 'capacity_kva', label: 'Capacity (kVA)' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {val ? 'Online' : 'Offline'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Voltage Regulators</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Regulator
        </button>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}

      <DataTable
        columns={columns}
        data={regulators}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {!loading && total > 0 && (
        <Pagination
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={handlePageChange}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add Regulator' : 'Edit Regulator'}
        onSubmit={handleSubmit}
        loading={formLoading}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Substation *</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white"
              value={formData.substation_id}
              onChange={(e) => setFormData({ ...formData, substation_id: e.target.value })}
            >
              <option value="">Select Substation...</option>
              {substations.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Input Voltage (V)</label>
            <input
              type="number"
              step="any"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.input_voltage}
              onChange={(e) => setFormData({ ...formData, input_voltage: e.target.value })}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Output Voltage (V)</label>
            <input
              type="number"
              step="any"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.output_voltage}
              onChange={(e) => setFormData({ ...formData, output_voltage: e.target.value })}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Capacity (kVA)</label>
            <input
              type="number"
              step="any"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.capacity_kva}
              onChange={(e) => setFormData({ ...formData, capacity_kva: e.target.value })}
            />
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-end pb-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                checked={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default RegulatorsPage;
