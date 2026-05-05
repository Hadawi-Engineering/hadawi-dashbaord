import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { CardFormData, Product } from '../types';
import ImageUpload from './ui/ImageUpload';
import { useScrollLock } from '../hooks/useScrollLock';

interface CardFormProps {
  card?: Product;
  onSubmit: (data: CardFormData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function CardForm({ card, onSubmit, onClose, isLoading = false }: CardFormProps) {
  useScrollLock(true);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CardFormData>({
    defaultValues: {
      nameAr: card?.nameAr || '',
      nameEn: card?.nameEn || '',
      descriptionAr: card?.descriptionAr || '',
      descriptionEn: card?.descriptionEn || '',
      price: card?.price ?? 0,
      images: card?.images || [],
      isActive: card?.isActive ?? true,
      stock: card?.stock ?? 0,
      sku: card?.sku || '',
    },
  });

  const images = watch('images') || [];

  const handleFormSubmit = (data: CardFormData) => {
    if (data.images.length === 0) {
      alert('Please upload at least one image');
      return;
    }
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {card?.id ? 'Edit Card' : 'Create New Card'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (English) *</label>
              <input
                {...register('nameEn', {
                  required: 'English name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Birthday Card"
              />
              {errors.nameEn && <p className="mt-1 text-sm text-red-600">{errors.nameEn.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (Arabic) *</label>
              <input
                {...register('nameAr', {
                  required: 'Arabic name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
                type="text"
                dir="rtl"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="بطاقة عيد ميلاد"
              />
              {errors.nameAr && <p className="mt-1 text-sm text-red-600">{errors.nameAr.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
              <textarea
                {...register('descriptionEn')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Arabic)</label>
              <textarea
                {...register('descriptionAr')}
                rows={3}
                dir="rtl"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="وصف اختياري"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (SAR) *</label>
              <input
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price cannot be negative' },
                  valueAsNumber: true,
                })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="15.00"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input
                {...register('stock', {
                  required: 'Stock is required',
                  min: { value: 0, message: 'Stock cannot be negative' },
                  valueAsNumber: true,
                })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="100"
              />
              {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Optional)</label>
            <input
              {...register('sku')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="CARD-001"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Images *</h3>
            <ImageUpload
              images={images}
              onChange={(newImages) => setValue('images', newImages)}
              multiple={true}
              maxImages={5}
              folder="cards"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...register('isActive')}
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : card?.id ? 'Update Card' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
