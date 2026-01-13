import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import adminService from '../services/adminService';
import type { ProductCategory, CategoryFormData } from '../types';
import CategoryForm from '../components/CategoryForm';

export default function Categories() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Fetch categories
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['productCategories'],
        queryFn: () => adminService.getProductCategories(true),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: CategoryFormData) => adminService.createProductCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productCategories'] });
            setShowForm(false);
            alert('Category created successfully!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to create category');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
            adminService.updateProductCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productCategories'] });
            setShowForm(false);
            setEditingCategory(null);
            alert('Category updated successfully!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to update category');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteProductCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productCategories'] });
            alert('Category deleted successfully!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to delete category. It may have products associated with it.');
        },
    });

    const handleSubmit = (data: CategoryFormData) => {
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (category: ProductCategory) => {
        // Transform ProductCategory to CategoryFormData, excluding read-only fields
        const formData: CategoryFormData = {
            nameAr: category.nameAr,
            nameEn: category.nameEn,
            descriptionAr: category.descriptionAr || '',
            descriptionEn: category.descriptionEn || '',
            image: category.image || '',
            icon: category.icon || '',
            parentId: category.parentId || '',
            isActive: category.isActive,
            sortOrder: category.sortOrder,
        };
        // Keep the category object for tracking which category is being edited
        setEditingCategory({ ...formData, id: category.id } as any);
        setShowForm(true);
    };

    const handleDelete = (category: ProductCategory) => {
        const productCount = category._count?.products || 0;
        if (productCount > 0) {
            alert(`Cannot delete category "${category.nameEn}" because it has ${productCount} product(s). Please remove or reassign the products first.`);
            return;
        }
        if (window.confirm(`Are you sure you want to delete "${category.nameEn}"?`)) {
            deleteMutation.mutate(category.id);
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingCategory(null);
    };

    const toggleExpand = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    // Build category tree
    const buildTree = (parentId: string | null = null, level: number = 0): ProductCategory[] => {
        return categories
            .filter(cat => cat.parentId === parentId)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(cat => ({
                ...cat,
                level,
                children: buildTree(cat.id, level + 1)
            }));
    };

    const categoryTree = buildTree(null);

    const renderCategory = (category: any) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedCategories.has(category.id);
        const productCount = category._count?.products || 0;

        return (
            <div key={category.id}>
                <div
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-200"
                    style={{ paddingLeft: `${category.level * 2 + 1}rem` }}
                >
                    {/* Expand/Collapse Button */}
                    {hasChildren ? (
                        <button
                            onClick={() => toggleExpand(category.id)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>
                    ) : (
                        <div className="w-5" />
                    )}

                    {/* Category Image */}
                    {category.image ? (
                        <img
                            src={category.image}
                            alt={category.nameEn}
                            className="w-10 h-10 object-cover rounded"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                            No Img
                        </div>
                    )}

                    {/* Category Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">
                                {category.nameEn} <span className="text-gray-500 text-sm font-normal" dir="rtl">({category.nameAr})</span>
                            </h3>
                            {!category.isActive && (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                    Inactive
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">
                            {productCount} product{productCount !== 1 ? 's' : ''} • Sort Order: {category.sortOrder}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={() => handleDelete(category)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Children */}
                {hasChildren && isExpanded && category.children.map(renderCategory)}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-600 mt-1">Manage product categories and subcategories</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <Plus size={20} />
                    New Category
                </button>
            </div>

            {/* Categories Tree */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading categories...</div>
                ) : categoryTree.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No categories found. Create your first category to get started.
                    </div>
                ) : (
                    <div>
                        {categoryTree.map(renderCategory)}
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <CategoryForm
                    category={editingCategory || undefined}
                    categories={categories}
                    onSubmit={handleSubmit}
                    onClose={handleCloseForm}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            )}
        </div>
    );
}
