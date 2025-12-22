import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import adminService from '../services/adminService';
import type { Brand, BrandFormData } from '../types';
import BrandForm from '../components/BrandForm';

export default function Brands() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    // Fetch brands
    const { data: brands = [], isLoading } = useQuery({
        queryKey: ['brands'],
        queryFn: () => adminService.getBrands(true),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: BrandFormData) => adminService.createBrand(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            setShowForm(false);
            alert('Brand created successfully!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to create brand');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: BrandFormData }) =>
            adminService.updateBrand(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            setShowForm(false);
            setEditingBrand(null);
            alert('Brand updated successfully!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to update brand');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteBrand(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            alert('Brand deleted successfully!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to delete brand. It may have products associated with it.');
        },
    });

    const handleSubmit = (data: BrandFormData) => {
        if (editingBrand) {
            updateMutation.mutate({ id: editingBrand.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (brand: Brand) => {
        // Transform Brand to BrandFormData, excluding read-only fields
        const formData: BrandFormData = {
            name: brand.name,
            description: brand.description || '',
            logo: brand.logo || '',
            website: brand.website || '',
            isActive: brand.isActive,
        };
        // Keep the brand object for tracking which brand is being edited
        setEditingBrand({ ...formData, id: brand.id } as any);
        setShowForm(true);
    };

    const handleDelete = (brand: Brand) => {
        const productCount = brand._count?.products || 0;
        if (productCount > 0) {
            alert(`Cannot delete brand "${brand.name}" because it has ${productCount} product(s). Please remove or reassign the products first.`);
            return;
        }
        if (window.confirm(`Are you sure you want to delete "${brand.name}"?`)) {
            deleteMutation.mutate(brand.id);
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingBrand(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
                    <p className="text-gray-600 mt-1">Manage product brands</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <Plus size={20} />
                    New Brand
                </button>
            </div>

            {/* Brands Grid */}
            <div className="bg-white rounded-lg shadow">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading brands...</div>
                ) : brands.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No brands found. Create your first brand to get started.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                        {brands.map((brand) => {
                            const productCount = brand._count?.products || 0;

                            return (
                                <div
                                    key={brand.id}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                    {/* Logo */}
                                    <div className="aspect-square mb-4 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                                        {brand.logo ? (
                                            <img
                                                src={brand.logo}
                                                alt={brand.name}
                                                className="w-full h-full object-contain p-4"
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-4xl font-bold">
                                                {brand.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Brand Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-gray-900 text-lg">{brand.name}</h3>
                                            {!brand.isActive && (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>

                                        {brand.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {brand.description}
                                            </p>
                                        )}

                                        <div className="text-sm text-gray-500">
                                            {productCount} product{productCount !== 1 ? 's' : ''}
                                        </div>

                                        {brand.website && (
                                            <a
                                                href={brand.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                            >
                                                Visit website
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleEdit(brand)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary-600 border border-primary-600 rounded hover:bg-primary-50"
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(brand)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <BrandForm
                    brand={editingBrand || undefined}
                    onSubmit={handleSubmit}
                    onClose={handleCloseForm}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            )}
        </div>
    );
}
