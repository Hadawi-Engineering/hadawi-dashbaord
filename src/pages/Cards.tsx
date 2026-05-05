import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Power, Search, Trash2 } from 'lucide-react';
import adminService from '../services/adminService';
import CardForm from '../components/CardForm';
import type { CardFormData, Product } from '../types';

type CardStatusFilter = 'all' | 'active' | 'inactive';

export default function Cards() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CardStatusFilter>('all');

  const { data: cardsData, isLoading } = useQuery({
    queryKey: ['cards', statusFilter],
    queryFn: () => adminService.getCards(
      statusFilter === 'all' ? {} : { isActive: statusFilter === 'active' }
    ),
  });

  const createMutation = useMutation({
    mutationFn: (data: CardFormData) => adminService.createCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setShowForm(false);
      alert('Card created successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create card');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CardFormData> }) =>
      adminService.updateCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setShowForm(false);
      setEditingCard(null);
      alert('Card updated successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update card');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      alert('Card deleted successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to delete card');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.toggleCardActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update card status');
    },
  });

  const cards = cardsData?.data || [];

  const filteredCards = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return cards;
    return cards.filter((card) =>
      card.nameEn.toLowerCase().includes(normalizedSearch) ||
      card.nameAr.toLowerCase().includes(normalizedSearch)
    );
  }, [cards, search]);

  const handleSubmit = (data: CardFormData) => {
    const payload = { ...data, isCard: true } as CardFormData & { isCard: true };
    if (editingCard) {
      updateMutation.mutate({ id: editingCard.id, data: payload });
      return;
    }
    createMutation.mutate(payload);
  };

  const handleEdit = (card: Product) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleDelete = (card: Product) => {
    if (window.confirm(`Are you sure you want to delete "${card.nameEn}"?`)) {
      deleteMutation.mutate(card.id);
    }
  };

  const handleToggleActive = (card: Product) => {
    toggleActiveMutation.mutate({ id: card.id, isActive: !card.isActive });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCard(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cards</h1>
          <p className="text-gray-600 mt-1">Manage card products and inventory</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus size={20} />
          Add Card
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by English/Arabic name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CardStatusFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading cards...</div>
        ) : filteredCards.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No cards found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {card.images?.[0] ? (
                        <img src={card.images[0]} alt={card.nameEn} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{card.nameEn}</div>
                      <div className="text-xs text-gray-500" dir="rtl">{card.nameAr}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{card.price.toFixed(2)} SAR</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.sku || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${card.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {card.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(card.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(card)}
                          disabled={toggleActiveMutation.isPending}
                          className="text-amber-600 hover:text-amber-900 disabled:opacity-50"
                          title={card.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={18} />
                        </button>
                        <button onClick={() => handleEdit(card)} className="text-primary-600 hover:text-primary-900">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(card)} className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <CardForm
          card={editingCard || undefined}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
