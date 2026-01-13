import React, { useState, useEffect } from 'react';
import { City, Region, CreateCityData, UpdateCityData } from '../types';
import adminService from '../services/adminService';

interface CityFormProps {
  city?: City;
  onSubmit: (data: CreateCityData | UpdateCityData) => Promise<void>;
  onCancel: () => void;
}

export const CityForm: React.FC<CityFormProps> = ({ city, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateCityData>({
    nameAr: city?.nameAr || '',
    nameEn: city?.nameEn || '',
    regionId: city?.regionId || '',
    isActive: city?.isActive ?? true,
    isOperational: city?.isOperational ?? false,
    sortOrder: city?.sortOrder ?? 0,
  });

  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const data = await adminService.getRegions();
      setRegions(data);
    } catch (err) {
      console.error('Failed to load regions:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save city');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Region *
        </label>
        <select
          value={formData.regionId}
          onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Select a region</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.nameEn} ({region.nameAr})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name (English) *
          </label>
          <input
            type="text"
            value={formData.nameEn}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Riyadh"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name (Arabic) *
          </label>
          <input
            type="text"
            value={formData.nameAr}
            onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="الرياض"
            dir="rtl"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort Order
          </label>
          <input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="0"
          />
        </div>

        <div className="flex items-end space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isOperational}
              onChange={(e) => setFormData({ ...formData, isOperational: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Operational</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : city ? 'Update City' : 'Create City'}
        </button>
      </div>
    </form>
  );
};

