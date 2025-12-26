import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { ProductFormData, ProductCategory, Brand } from '../types';
import { OCCASION_TYPES, RECIPIENT_TYPES } from '../types';
import ImageUpload from './ui/ImageUpload';
import MultiSelect from './ui/MultiSelect';
import TagInput from './ui/TagInput';

interface ProductFormProps {
    product?: ProductFormData & { id?: string };
    categories: ProductCategory[];
    brands: Brand[];
    onSubmit: (data: ProductFormData) => void;
    onClose: () => void;
    isLoading?: boolean;
}

export default function ProductForm({
    product,
    categories,
    brands,
    onSubmit,
    onClose,
    isLoading = false
}: ProductFormProps) {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
        defaultValues: product || {
            nameAr: '',
            nameEn: '',
            descriptionAr: '',
            descriptionEn: '',
            price: 0,
            images: [],
            categoryId: '',
            brandId: '',
            occasionTypes: [],
            recipientTypes: [],
            isActive: true,
            isFeatured: false,
            stock: 0,
            sku: '',
            tags: [],
        }
    });

    const images = watch('images') || [];
    const occasionTypes = watch('occasionTypes') || [];
    const recipientTypes = watch('recipientTypes') || [];
    const tags = watch('tags') || [];

    const handleFormSubmit = (data: ProductFormData) => {
        if (data.images.length === 0) {
            alert('Please upload at least one image');
            return;
        }
        // Remove id field if it exists (it's only used for determining edit mode, not for submission)
        const { id, ...cleanData } = data as any;
        onSubmit(cleanData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {product?.id ? 'Edit Product' : 'Create New Product'}
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
                        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name (English) *
                                </label>
                                <input
                                    {...register('nameEn', {
                                        required: 'Product name (English) is required',
                                        minLength: { value: 3, message: 'Name must be at least 3 characters' }
                                    })}
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter product name in English"
                                />
                                {errors.nameEn && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nameEn.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name (Arabic) *
                                </label>
                                <input
                                    {...register('nameAr', {
                                        required: 'Product name (Arabic) is required',
                                        minLength: { value: 3, message: 'Name must be at least 3 characters' }
                                    })}
                                    type="text"
                                    dir="rtl"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="أدخل اسم المنتج"
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
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter product description in English"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Arabic)
                                </label>
                                <textarea
                                    {...register('descriptionAr')}
                                    rows={4}
                                    dir="rtl"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="أدخل وصف المنتج"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (SAR) *
                                </label>
                                <input
                                    {...register('price', {
                                        required: 'Price is required',
                                        min: { value: 0.01, message: 'Price must be greater than 0' },
                                        valueAsNumber: true
                                    })}
                                    type="number"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="0.00"
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Stock Quantity *
                                </label>
                                <input
                                    {...register('stock', {
                                        required: 'Stock is required',
                                        min: { value: 0, message: 'Stock cannot be negative' },
                                        valueAsNumber: true
                                    })}
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="0"
                                />
                                {errors.stock && (
                                    <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                SKU (Optional)
                            </label>
                            <input
                                {...register('sku')}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Enter SKU"
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Product Images *</h3>
                        <ImageUpload
                            images={images}
                            onChange={(newImages) => setValue('images', newImages)}
                            multiple={true}
                            maxImages={5}
                            folder="products"
                        />
                    </div>

                    {/* Category & Brand */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                {...register('categoryId')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.nameEn} {category.nameAr ? `(${category.nameAr})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Brand
                            </label>
                            <select
                                {...register('brandId')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Select a brand</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>
                                        {brand.nameEn} {brand.nameAr ? `(${brand.nameAr})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Occasion & Recipient Types */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MultiSelect
                            label="Occasion Types"
                            options={OCCASION_TYPES}
                            value={occasionTypes}
                            onChange={(value) => setValue('occasionTypes', value)}
                            placeholder="Select occasion types"
                        />

                        <MultiSelect
                            label="Recipient Types"
                            options={RECIPIENT_TYPES}
                            value={recipientTypes}
                            onChange={(value) => setValue('recipientTypes', value)}
                            placeholder="Select recipient types"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <TagInput
                            label="Tags"
                            tags={tags}
                            onChange={(value) => setValue('tags', value)}
                            placeholder="Type and press Enter to add tags"
                        />
                    </div>

                    {/* Status Toggles */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Status</h3>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    {...register('isActive')}
                                    type="checkbox"
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    {...register('isFeatured')}
                                    type="checkbox"
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Featured</span>
                            </label>
                        </div>
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
                            {isLoading ? 'Saving...' : product?.id ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
