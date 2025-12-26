import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import adminService from '../services/adminService';
import type { Product, ProductFormData, ProductFilters } from '../types';
import ProductForm from '../components/ProductForm';

export default function Products() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [filters, setFilters] = useState<ProductFilters>({
        page: 1,
        limit: 20,
        search: '',
        categoryId: '',
        brandId: '',
    });

    // Fetch products
    const { data: productsData, isLoading } = useQuery({
        queryKey: ['products', filters],
        queryFn: () => adminService.getProducts(filters),
    });

    // Fetch categories for filter
    const { data: categories = [] } = useQuery({
        queryKey: ['productCategories'],
        queryFn: () => adminService.getProductCategories(true),
    });

    // Fetch brands for filter
    const { data: brands = [] } = useQuery({
        queryKey: ['brands'],
        queryFn: () => adminService.getBrands(true),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: ProductFormData) => adminService.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setShowForm(false);
            alert('Product created successfully!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to create product');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: ProductFormData }) =>
            adminService.updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setShowForm(false);
            setEditingProduct(null);
            alert('Product updated successfully!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to update product');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            alert('Product deleted successfully!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to delete product');
        },
    });

    const handleSubmit = (data: ProductFormData) => {
        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (product: Product) => {
        // Transform Product to ProductFormData, excluding read-only fields and relation objects
        const formData: ProductFormData = {
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            descriptionAr: product.descriptionAr || '',
            descriptionEn: product.descriptionEn || '',
            price: product.price,
            images: product.images,
            categoryId: product.categoryId || '',
            brandId: product.brandId || '',
            occasionTypes: product.occasionTypes,
            recipientTypes: product.recipientTypes,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
            stock: product.stock,
            sku: product.sku || '',
            tags: product.tags,
        };
        // Keep the product object for tracking which product is being edited
        setEditingProduct({ ...formData, id: product.id } as any);
        setShowForm(true);
    };

    const handleDelete = (product: Product) => {
        if (window.confirm(`Are you sure you want to delete "${product.nameEn}"?`)) {
            deleteMutation.mutate(product.id);
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    const products = productsData?.data || [];
    const meta = productsData?.meta;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600 mt-1">Manage your product catalog</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <Plus size={20} />
                    New Product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <select
                        value={filters.categoryId || ''}
                        onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, page: 1 })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.nameEn} {category.nameAr ? `(${category.nameAr})` : ''}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.brandId || ''}
                        onChange={(e) => setFilters({ ...filters, brandId: e.target.value, page: 1 })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">All Brands</option>
                        {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>
                                {brand.nameEn} {brand.nameAr ? `(${brand.nameAr})` : ''}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setFilters({ page: 1, limit: 20, search: '', categoryId: '', brandId: '' })}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No products found. Create your first product to get started.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Image
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Brand
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {product.images[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.nameEn}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                                        No Image
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{product.nameEn}</div>
                                                <div className="text-xs text-gray-500" dir="rtl">{product.nameAr}</div>
                                                {product.sku && (
                                                    <div className="text-xs text-gray-500 mt-1">SKU: {product.sku}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.category?.nameEn || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.brand?.nameEn || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {product.price.toFixed(2)} SAR
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.stock}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {product.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {product.isFeatured && (
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="text-primary-600 hover:text-primary-900"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {meta && meta.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing page {meta.page} of {meta.totalPages} ({meta.total} total products)
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
                                        disabled={filters.page === 1}
                                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
                                        disabled={filters.page === meta.totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <ProductForm
                    product={editingProduct || undefined}
                    categories={categories}
                    brands={brands}
                    onSubmit={handleSubmit}
                    onClose={handleCloseForm}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            )}
        </div>
    );
}
