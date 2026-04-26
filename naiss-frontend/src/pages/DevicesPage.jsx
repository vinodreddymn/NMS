import React, { useState, useEffect } from 'react';
import { deviceAPI, deviceTypeAPI, poleAPI, switchAPI } from '../api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [poles, setPoles] = useState([]);
  const [switches, setSwitches] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  
  const initialFormState = {
    device_type_id: '',
    pole_id: '',
    switch_id: '',
    device_name: '',
    ip_address: '',
    mac_address: '',
    brand: '',
    model: '',
    serial_number: '',
    status: true,
    location: '',
    remarks: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [devicesRes, typesRes, polesRes, switchesRes] = await Promise.all([
        deviceAPI.getAll(limit, offset),
        deviceTypeAPI.getAll(100, 0),
        poleAPI.getAll(100, 0),
        switchAPI.getAll(100, 0)
      ]);
      
      setDevices(devicesRes.data.data);
      setTotal(devicesRes.data.total);
      
      setDeviceTypes(typesRes.data.data || []);
      setPoles(polesRes.data.data || []);
      setSwitches(switchesRes.data.data || []);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
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
      device_type_id: row.device_type_id || '',
      pole_id: row.pole_id || '',
      switch_id: row.switch_id || '',
      device_name: row.device_name || '',
      ip_address: row.ip_address || '',
      mac_address: row.mac_address || '',
      brand: row.brand || '',
      model: row.model || '',
      serial_number: row.serial_number || '',
      status: row.status !== false,
      location: row.location || '',
      remarks: row.remarks || ''
    });
    setSelectedId(row.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to delete ${row.device_name}?`)) {
      try {
        await deviceAPI.delete(row.id);
        fetchData();
      } catch (err) {
        alert('Failed to delete device');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.device_name || !formData.device_type_id) {
      alert('Device name and Device Type are required');
      return;
    }

    const payload = { ...formData };
    // Clean empty foreign keys
    if (!payload.pole_id) payload.pole_id = null;
    if (!payload.switch_id) payload.switch_id = null;

    setFormLoading(true);
    try {
      if (modalMode === 'add') {
        await deviceAPI.create(payload);
      } else {
        await deviceAPI.update(selectedId, payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Failed to ${modalMode} device: ${err.response?.data?.error || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    { key: 'device_name', label: 'Name' },
    { key: 'ip_address', label: 'IP Address' },
    { key: 'mac_address', label: 'MAC Address' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {val ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { key: 'location', label: 'Location' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Device
        </button>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}

      <DataTable
        columns={columns}
        data={devices}
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
        title={modalMode === 'add' ? 'Add Device' : 'Edit Device'}
        onSubmit={handleSubmit}
        loading={formLoading}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Device Name *</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.device_name}
              onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Device Type *</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white"
              value={formData.device_type_id}
              onChange={(e) => setFormData({ ...formData, device_type_id: e.target.value })}
            >
              <option value="">Select a type...</option>
              {deviceTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name || t.type_name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">IP Address</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.ip_address}
              onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">MAC Address</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.mac_address}
              onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Pole</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white"
              value={formData.pole_id}
              onChange={(e) => setFormData({ ...formData, pole_id: e.target.value })}
            >
              <option value="">None</option>
              {poles.map(p => (
                <option key={p.id} value={p.id}>{p.pole_number}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Switch</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white"
              value={formData.switch_id}
              onChange={(e) => setFormData({ ...formData, switch_id: e.target.value })}
            >
              <option value="">None</option>
              {switches.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
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

export default DevicesPage;
