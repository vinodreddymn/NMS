import React, { useState, useEffect } from 'react';
import { poleAPI, regulatorAPI } from '../api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

function PolesPage() {
  const [poles, setPoles] = useState([]);
  const [regulators, setRegulators] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  
  const initialFormState = {
    pole_number: '',
    location: '',
    regulator_id: '',
    phase: '',
    latitude: '',
    longitude: '',
    distance_from_previous: '',
    installation_date: '',
    status: true,
    remarks: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [polesRes, regRes] = await Promise.all([
        poleAPI.getAll(limit, offset),
        regulatorAPI.getAll(100, 0)
      ]);
      
      setPoles(polesRes.data.data);
      setTotal(polesRes.data.total);
      setRegulators(regRes.data.data || []);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch poles');
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
      pole_number: row.pole_number || '',
      location: row.location || '',
      regulator_id: row.regulator_id || '',
      phase: row.phase || '',
      latitude: row.latitude || '',
      longitude: row.longitude || '',
      distance_from_previous: row.distance_from_previous || '',
      installation_date: row.installation_date ? new Date(row.installation_date).toISOString().split('T')[0] : '',
      status: row.status !== false,
      remarks: row.remarks || ''
    });
    setSelectedId(row.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to delete pole ${row.pole_number}?`)) {
      try {
        await poleAPI.delete(row.id);
        fetchData();
      } catch (err) {
        alert('Failed to delete pole');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.pole_number) {
      alert('Pole number is required');
      return;
    }

    const payload = { ...formData };
    if (!payload.regulator_id) payload.regulator_id = null;
    if (payload.distance_from_previous) payload.distance_from_previous = parseFloat(payload.distance_from_previous);
    if (!payload.distance_from_previous && payload.distance_from_previous !== 0) payload.distance_from_previous = null;
    if (!payload.installation_date) payload.installation_date = null;
    if (payload.latitude) payload.latitude = parseFloat(payload.latitude);
    if (!payload.latitude && payload.latitude !== 0) payload.latitude = null;
    if (payload.longitude) payload.longitude = parseFloat(payload.longitude);
    if (!payload.longitude && payload.longitude !== 0) payload.longitude = null;

    setFormLoading(true);
    try {
      if (modalMode === 'add') {
        await poleAPI.create(payload);
      } else {
        await poleAPI.update(selectedId, payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Failed to ${modalMode} pole: ${err.response?.data?.error || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    { key: 'pole_number', label: 'Pole Number' },
    { key: 'location', label: 'Location' },
    { key: 'phase', label: 'Phase' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {val ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Poles</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Pole
        </button>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}

      <DataTable
        columns={columns}
        data={poles}
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
        title={modalMode === 'add' ? 'Add Pole' : 'Edit Pole'}
        onSubmit={handleSubmit}
        loading={formLoading}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Pole Number *</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.pole_number}
              onChange={(e) => setFormData({ ...formData, pole_number: e.target.value })}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Phase</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.phase}
              onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="number"
              step="any"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input
              type="number"
              step="any"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Distance From Prev. (m)</label>
            <input
              type="number"
              step="any"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.distance_from_previous}
              onChange={(e) => setFormData({ ...formData, distance_from_previous: e.target.value })}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Installation Date</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.installation_date}
              onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Voltage Regulator</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white"
              value={formData.regulator_id}
              onChange={(e) => setFormData({ ...formData, regulator_id: e.target.value })}
            >
              <option value="">None</option>
              {regulators.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
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

export default PolesPage;
