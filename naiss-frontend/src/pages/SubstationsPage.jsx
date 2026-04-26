import React, { useState, useEffect } from 'react';
import { substationAPI } from '../api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

function SubstationsPage() {
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
    location: '',
    ht_panel_status: true,
    lt_panel_status: true,
    ups_status: true,
    dg_status: true,
    transformer_status: true
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await substationAPI.getAll(limit, offset);
      setSubstations(response.data.data);
      setTotal(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch substations');
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
      location: row.location || '',
      ht_panel_status: row.ht_panel_status !== false,
      lt_panel_status: row.lt_panel_status !== false,
      ups_status: row.ups_status !== false,
      dg_status: row.dg_status !== false,
      transformer_status: row.transformer_status !== false
    });
    setSelectedId(row.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to delete substation ${row.name}?`)) {
      try {
        await substationAPI.delete(row.id);
        fetchData();
      } catch (err) {
        alert('Failed to delete substation');
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
        await substationAPI.create(formData);
      } else {
        await substationAPI.update(selectedId, formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Failed to ${modalMode} substation: ${err.response?.data?.error || err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const StatusPill = ({ status, label }) => (
    <span className={`px-2 py-1 mx-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} title={label}>
      {label}
    </span>
  );

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'location', label: 'Location' },
    { 
      key: 'equipment_status', 
      label: 'Equipment Status',
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          <StatusPill status={row.transformer_status} label="TRF" />
          <StatusPill status={row.ht_panel_status} label="HT" />
          <StatusPill status={row.lt_panel_status} label="LT" />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Substations</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Substation
        </button>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}

      <DataTable
        columns={columns}
        data={substations}
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
        title={modalMode === 'add' ? 'Add Substation' : 'Edit Substation'}
        onSubmit={handleSubmit}
        loading={formLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Equipment Status</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'transformer_status', label: 'Transformer' },
                { key: 'ht_panel_status', label: 'HT Panel' },
                { key: 'lt_panel_status', label: 'LT Panel' },
                { key: 'ups_status', label: 'UPS' },
                { key: 'dg_status', label: 'DG Set' }
              ].map(eq => (
                <label key={eq.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    checked={formData[eq.key]}
                    onChange={(e) => setFormData({ ...formData, [eq.key]: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">{eq.label} OK</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SubstationsPage;
