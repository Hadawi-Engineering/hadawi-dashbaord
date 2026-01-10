import React, { useState, useEffect } from 'react';
import { City } from '../types';
import adminService from '../services/adminService';
import { CityForm } from '../components/CityForm';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';

export const Cities: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState<City | undefined>();

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCities();
      setCities(data);
    } catch (error) {
      console.error('Failed to load cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    await adminService.createCity(data);
    setShowForm(false);
    loadCities();
  };

  const handleUpdate = async (data: any) => {
    if (editingCity) {
      await adminService.updateCity(editingCity.id, data);
      setEditingCity(undefined);
      setShowForm(false);
      loadCities();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this city?')) {
      try {
        await adminService.deleteCity(id);
        loadCities();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete city');
      }
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cities</h1>
        <button
          onClick={() => {
            setEditingCity(undefined);
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Add City</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingCity ? 'Edit City' : 'New City'}
          </h2>
          <CityForm
            city={editingCity}
            onSubmit={editingCity ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingCity(undefined);
            }}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name (EN)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name (AR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quarters</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cities.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No cities found. Click "Add City" to create one.
                </td>
              </tr>
            ) : (
              cities.map((city) => (
                <tr key={city.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {city.region ? (
                      <span>
                        {city.region.nameEn} ({city.region.code})
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{city.nameEn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" dir="rtl">{city.nameAr}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs rounded ${city.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {city.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs rounded ${city.isOperational ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {city.isOperational ? 'Operational' : 'Not Operational'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{city.quarters?.length || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingCity(city);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(city.id)}
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

