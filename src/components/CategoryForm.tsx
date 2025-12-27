import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { CategoryFormData, ProductCategory } from '../types';
import ImageUpload from './ui/ImageUpload';
import { useScrollLock } from '../hooks/useScrollLock';

interface CategoryFormProps {
    category?: CategoryFormData & { id?: string };
    categories: ProductCategory[];
    onSubmit: (data: CategoryFormData) => void;
    onClose: () => void;
    isLoading?: boolean;
}

export default function CategoryForm({
    category,
    categories,
    onSubmit,
    onClose,
    isLoading = false
}: CategoryFormProps) {
    useScrollLock(true);
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CategoryFormData>({
        defaultValues: category || {
            nameAr: '',
            nameEn: '',
            descriptionAr: '',
            descriptionEn: '',
            image: '',
            icon: '',
            parentId: '',
            isActive: true,
            sortOrder: 0,
        }
    });

    const image = watch('image');

    // Filter out the current category from parent options to prevent circular references
    const availableParents = categories.filter(c => c.id !== category?.id);

    const handleFormSubmit = (data: CategoryFormData) => {
        // Remove empty parentId
        if (!data.parentId) {
            delete data.parentId;
        }
        // Remove read-only fields if they exist (only used for determining edit mode, not for submission)
        const { id, createdAt, updatedAt, _count, children, level, ...cleanData } = data as any;
        onSubmit(cleanData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {category?.id ? 'Edit Category' : 'Create New Category'}
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
                                    Category Name (English) *
                                </label>
                                <input
                                    {...register('nameEn', {
                                        required: 'Category name (English) is required',
                                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                    })}
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter category name in English"
                                />
                                {errors.nameEn && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nameEn.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name (Arabic) *
                                </label>
                                <input
                                    {...register('nameAr', {
                                        required: 'Category name (Arabic) is required',
                                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                    })}
                                    type="text"
                                    dir="rtl"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="أدخل اسم القسم"
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
                                    placeholder="Enter category description in English"
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
                                    placeholder="أدخل وصف القسم"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Image
                        </label>
                        <ImageUpload
                            images={image ? [image] : []}
                            onChange={(images) => setValue('image', images[0] || '')}
                            multiple={false}
                            folder="categories"
                        />
                    </div>

                    {/* Parent Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Parent Category (Optional)
                        </label>
                        <select
                            {...register('parentId')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">None (Top Level Category)</option>
                            {availableParents.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nameEn} {cat.nameAr ? `(${cat.nameAr})` : ''}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Select a parent category to create a subcategory
                        </p>
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sort Order
                        </label>
                        <input
                            {...register('sortOrder', {
                                min: { value: 0, message: 'Sort order cannot be negative' },
                                valueAsNumber: true
                            })}
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="0"
                        />
                        {errors.sortOrder && (
                            <p className="mt-1 text-sm text-red-600">{errors.sortOrder.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Lower numbers appear first
                        </p>
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
                            {isLoading ? 'Saving...' : category?.id ? 'Update Category' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
