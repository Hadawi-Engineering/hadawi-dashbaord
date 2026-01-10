import React, { useState, useEffect } from 'react';
import { Region } from '../types';
import adminService from '../services/adminService';
import { RegionForm } from '../components/RegionForm';
import { Plus, Edit2, Trash2, Globe } from 'lucide-react';

export const Regions: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | undefined>();

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRegions();
      setRegions(data);
    } catch (error) {
      console.error('Failed to load regions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    await adminService.createRegion(data);
    setShowForm(false);
    loadRegions();
  };

  const handleUpdate = async (data: any) => {
    if (editingRegion) {
      await adminService.updateRegion(editingRegion.id, data);
      setEditingRegion(undefined);
      setShowForm(false);
      loadRegions();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this region? This will fail if it has cities.')) {
      try {
        await adminService.deleteRegion(id);
        loadRegions();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete region');
      }
    }
  };

  const handleToggleOperational = async (id: string) => {
    try {
      await adminService.toggleRegionOperational(id);
      loadRegions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to toggle operational status');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Regions</h1>
        <button
          onClick={() => {
            setEditingRegion(undefined);
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Add Region</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingRegion ? 'Edit Region' : 'New Region'}
          </h2>
          <RegionForm
            region={editingRegion}
            onSubmit={editingRegion ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingRegion(undefined);
            }}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name (EN)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name (AR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cities</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {regions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No regions found. Click "Add Region" to create one.
                </td>
              </tr>
            ) : (
              regions.map((region) => (
                <tr key={region.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{region.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{region.nameEn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" dir="rtl">{region.nameAr}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{region.currency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{region.phonePrefix}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{region.cities?.length || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs rounded ${region.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {region.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleToggleOperational(region.id)}
                        className={`inline-flex px-2 py-1 text-xs rounded cursor-pointer ${region.isOperational ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {region.isOperational ? 'Operational' : 'Not Operational'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingRegion(region);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(region.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

