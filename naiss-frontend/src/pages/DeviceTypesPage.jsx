import React, { useState, useEffect } from 'react';
import { deviceTypeAPI } from '../api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

function DeviceTypesPage() {
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const initialFormState = {
    name: '',
    category: '',
    description: '',
    supports_ping: true,
    supports_snmp: false,
    requires_power: true,
    manufacturer_default: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchDeviceTypes = async () => {
    setLoading(true);
    try {
      const response = await deviceTypeAPI.getAll(limit, offset);
      setDeviceTypes(response.data.data);
      setTotal(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch device types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceTypes();
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
      category: row.category || '',
      description: row.description || '',
      supports_ping: row.supports_ping !== false,
      supports_snmp: row.supports_snmp === true,
      requires_power: row.requires_power !== false,
      manufacturer_default: row.manufacturer_default || ''
    });
    setSelectedId(row.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
      try {
        await deviceTypeAPI.delete(row.id);
        fetchDeviceTypes();
      } catch (err) {
        alert('Failed to delete device type');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Name is required');
      return;
    }

    setFormLoading(true);
    try {
      if (modalMode === 'add') {
        await deviceTypeAPI.create(formData);
      } else {
        await deviceTypeAPI.update(selectedId, formData);
      }
      setIsModalOpen(false);
      fetchDeviceTypes();
    } catch (err) {
      alert(`Failed to ${modalMode} device type: ${err.response?.data?.error || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'manufacturer_default', label: 'Default Manufacturer' },
    {
      key: 'features',
      label: 'Features',
      render: (_, row) => (
        <div className="flex gap-1 text-xs">
          {row.supports_ping && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Ping</span>}
          {row.supports_snmp && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">SNMP</span>}
          {row.requires_power && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Power</span>}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Device Types</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Device Type
        </button>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}

      <DataTable
        columns={columns}
        data={deviceTypes}
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
        title={modalMode === 'add' ? 'Add Device Type' : 'Edit Device Type'}
        onSubmit={handleSubmit}
        loading={formLoading}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Default Manufacturer</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.manufacturer_default}
              onChange={(e) => setFormData({ ...formData, manufacturer_default: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="col-span-2 flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                checked={formData.supports_ping}
                onChange={(e) => setFormData({ ...formData, supports_ping: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Supports Ping</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                checked={formData.supports_snmp}
                onChange={(e) => setFormData({ ...formData, supports_snmp: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Supports SNMP</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                checked={formData.requires_power}
                onChange={(e) => setFormData({ ...formData, requires_power: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Requires Power</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DeviceTypesPage;
