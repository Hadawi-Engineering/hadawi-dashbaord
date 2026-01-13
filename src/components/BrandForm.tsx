import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { BrandFormData } from '../types';
import ImageUpload from './ui/ImageUpload';
import { useScrollLock } from '../hooks/useScrollLock';

interface BrandFormProps {
    brand?: BrandFormData & { id?: string };
    onSubmit: (data: BrandFormData) => void;
    onClose: () => void;
    isLoading?: boolean;
}

export default function BrandForm({
    brand,
    onSubmit,
    onClose,
    isLoading = false
}: BrandFormProps) {
    useScrollLock(true);
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BrandFormData>({
        defaultValues: brand || {
            nameAr: '',
            nameEn: '',
            descriptionAr: '',
            descriptionEn: '',
            logo: '',
            website: '',
            isActive: true,
        }
    });

    const logo = watch('logo');

    const handleFormSubmit = (data: BrandFormData) => {
        // Remove read-only fields if they exist (only used for determining edit mode, not for submission)
        const { id, createdAt, updatedAt, _count, ...cleanData } = data as any;
        onSubmit(cleanData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {brand?.id ? 'Edit Brand' : 'Create New Brand'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Brand Name (English) *
                                </label>
                                <input
                                    {...register('nameEn', {
                                        required: 'Brand name (English) is required',
                                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                    })}
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter brand name in English"
                                />
                                {errors.nameEn && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nameEn.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Brand Name (Arabic) *
                                </label>
                                <input
                                    {...register('nameAr', {
                                        required: 'Brand name (Arabic) is required',
                                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                    })}
                                    type="text"
                                    dir="rtl"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="أدخل اسم العلامة التجارية"
                                />
                                {errors.nameAr && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nameAr.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (English)
                                </label>
                                <textarea
                                    {...register('descriptionEn')}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter brand description in English"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Arabic)
                                </label>
                                <textarea
                                    {...register('descriptionAr')}
                                    rows={3}
                                    dir="rtl"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="أدخل وصف العلامة التجارية"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Website URL
                            </label>
                            <input
                                {...register('website', {
                                    pattern: {
                                        value: /^https?:\/\/.+/,
                                        message: 'Please enter a valid URL (starting with http:// or https://)'
                                    }
                                })}
                                type="url"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="https://example.com"
                            />
                            {errors.website && (
                                <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Logo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Brand Logo
                        </label>
                        <ImageUpload
                            images={logo ? [logo] : []}
                            onChange={(images) => setValue('logo', images[0] || '')}
                            multiple={false}
                            folder="brands"
                        />
                    </div>

                    {/* Status */}
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

                    {/* Actions */}
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
                            {isLoading ? 'Saving...' : brand?.id ? 'Update Brand' : 'Create Brand'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
