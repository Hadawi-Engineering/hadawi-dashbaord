import React, { useState } from 'react';
import { Region, CreateRegionData, UpdateRegionData } from '../types';

interface RegionFormProps {
  region?: Region;
  onSubmit: (data: CreateRegionData | UpdateRegionData) => Promise<void>;
  onCancel: () => void;
}

export const RegionForm: React.FC<RegionFormProps> = ({ region, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateRegionData>({
    code: region?.code || '',
    nameAr: region?.nameAr || '',
    nameEn: region?.nameEn || '',
    currency: region?.currency || 'SAR',
    phonePrefix: region?.phonePrefix || '',
    isActive: region?.isActive ?? true,
    isOperational: region?.isOperational ?? false,
    sortOrder: region?.sortOrder ?? 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save region');
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country Code (ISO) *
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="SA"
            maxLength={2}
            required
            disabled={!!region} // Can't change code for existing region
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Prefix *
          </label>
          <input
            type="text"
            value={formData.phonePrefix}
            onChange={(e) => setFormData({ ...formData, phonePrefix: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="+966"
            required
          />
        </div>
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
            placeholder="Saudi Arabia"
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
            placeholder="المملكة العربية السعودية"
            dir="rtl"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <input
            type="text"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="SAR"
            maxLength={3}
          />
        </div>

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

        <div className="flex items-end">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isOperational}
            onChange={(e) => setFormData({ ...formData, isOperational: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Operational</span>
          <span className="text-xs text-gray-500">(Users can create occasions in this region)</span>
        </label>
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
          {loading ? 'Saving...' : region ? 'Update Region' : 'Create Region'}
        </button>
      </div>
    </form>
  );
};

