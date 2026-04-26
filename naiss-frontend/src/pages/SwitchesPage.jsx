import React, { useState, useEffect } from 'react';
import { switchAPI, poleAPI } from '../api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

function SwitchesPage() {
  const [switches, setSwitches] = useState([]);
  const [poles, setPoles] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  
  const initialFormState = {
    name: '',
    ip_address: '',
    mac_address: '',
    switch_type: '',
    location: '',
    pole_id: '',
    parent_switch_id: '',
    total_ports: '',
    status: true,
    snmp_enabled: true,
    brand: '',
    model: '',
    remarks: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [switchesRes, polesRes] = await Promise.all([
        switchAPI.getAll(limit, offset),
        poleAPI.getAll(100, 0)
      ]);
      
      setSwitches(switchesRes.data.data);
      setTotal(switchesRes.data.total);
      setPoles(polesRes.data.data || []);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch switches');
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
      ip_address: row.ip_address || '',
      mac_address: row.mac_address || '',
      switch_type: row.switch_type || '',
      location: row.location || '',
      pole_id: row.pole_id || '',
      parent_switch_id: row.parent_switch_id || '',
      total_ports: row.total_ports || '',
      status: row.status !== false,
      snmp_enabled: row.snmp_enabled !== false,
      brand: row.brand || '',
      model: row.model || '',
      remarks: row.remarks || ''
    });
    setSelectedId(row.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to delete switch ${row.name}?`)) {
      try {
        await switchAPI.delete(row.id);
        fetchData();
      } catch (err) {
        alert('Failed to delete switch');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.ip_address) {
      alert('Name and IP Address are required');
      return;
    }

    const payload = { ...formData };
    if (!payload.pole_id) payload.pole_id = null;
    if (!payload.parent_switch_id) payload.parent_switch_id = null;
    if (payload.total_ports) payload.total_ports = parseInt(payload.total_ports, 10);

    setFormLoading(true);
    try {
      if (modalMode === 'add') {
        await switchAPI.create(payload);
      } else {
        await switchAPI.update(selectedId, payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Failed to ${modalMode} switch: ${err.response?.data?.error || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'ip_address', label: 'IP Address' },
    { key: 'switch_type', label: 'Type' },
    { key: 'total_ports', label: 'Ports' },
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
        <h1 className="text-2xl font-bold text-gray-900">Switches</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Switch
        </button>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}

      <DataTable
        columns={columns}
        data={switches}
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
        title={modalMode === 'add' ? 'Add Switch' : 'Edit Switch'}
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
            <label className="block text-sm font-medium text-gray-700">IP Address *</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.ip_address}
              onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Switch Type</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.switch_type}
              onChange={(e) => setFormData({ ...formData, switch_type: e.target.value })}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Total Ports</label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.total_ports}
              onChange={(e) => setFormData({ ...formData, total_ports: e.target.value })}
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
            <label className="block text-sm font-medium text-gray-700">Parent Switch</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white"
              value={formData.parent_switch_id}
              onChange={(e) => setFormData({ ...formData, parent_switch_id: e.target.value })}
            >
              <option value="">None</option>
              {switches.filter(s => s.id !== selectedId).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                checked={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                checked={formData.snmp_enabled}
                onChange={(e) => setFormData({ ...formData, snmp_enabled: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">SNMP Enabled</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SwitchesPage;
