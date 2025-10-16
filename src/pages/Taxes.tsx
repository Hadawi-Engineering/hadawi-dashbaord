import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, BarChart3, Calculator, Receipt, Settings } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useLanguage } from '../contexts/LanguageContext';
import type { Tax, TaxStatistics } from '../types';

type TaxCategory = 'service' | 'delivery' | 'custom';

export default function Taxes() {
  const { t, isRTL } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TaxCategory>('service');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    category: 'service' as Tax['category'],
    type: 'percent' as Tax['type'],
    amount: 0,
    status: 'active' as Tax['status'],
  });

  // Fetch all taxes
  const { data: taxes, isLoading } = useQuery({
    queryKey: ['taxes'],
    queryFn: () => adminService.getTaxes(),
  });

  // Fetch tax by category
  const { data: categoryTax, isLoading: isLoadingCategory } = useQuery({
    queryKey: ['tax-category', selectedCategory],
    queryFn: () => adminService.getTaxByCategory(selectedCategory),
    enabled: false, // We'll trigger this manually
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['tax-statistics'],
    queryFn: () => adminService.getTaxStatistics(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<Tax, 'id' | 'createdAt' | 'updatedAt'>) =>
      adminService.createTax(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      queryClient.invalidateQueries({ queryKey: ['tax-statistics'] });
      handleCloseModal();
      alert(t('taxes.taxCreated'));
    },
    onError: () => alert(t('common.error')),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tax> }) =>
      adminService.updateTax(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      queryClient.invalidateQueries({ queryKey: ['tax-statistics'] });
      handleCloseModal();
      alert(t('taxes.taxUpdated'));
    },
    onError: () => alert(t('common.error')),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      queryClient.invalidateQueries({ queryKey: ['tax-statistics'] });
      alert(t('taxes.taxDeleted'));
    },
    onError: () => alert(t('common.error')),
  });

  const handleOpenModal = (category: TaxCategory, tax?: Tax) => {
    setSelectedCategory(category);
    if (tax) {
      setEditingTax(tax);
      setFormData({
        name: tax.name,
        category: tax.category,
        type: tax.type,
        amount: tax.amount,
        status: tax.status,
      });
    } else {
      setEditingTax(null);
      setFormData({
        name: '',
        category: category,
        type: 'percent',
        amount: 0,
        status: 'active',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTax(null);
  };

  const handleCloseStatsModal = () => {
    setShowStatsModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTax) {
        await updateMutation.mutateAsync({ id: editingTax.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      alert(t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('taxes.deleteConfirm'))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert(t('common.error'));
      }
    }
  };

  const getCategoryBadge = (category: Tax['category']) => {
    const config = {
      service: { color: 'blue' as const, label: t('taxes.categories.service') },
      delivery: { color: 'green' as const, label: t('taxes.categories.delivery') },
      custom: { color: 'purple' as const, label: t('taxes.categories.custom') },
    };
    return <Badge color={config[category].color}>{config[category].label}</Badge>;
  };

  const getTypeBadge = (type: Tax['type']) => {
    const config = {
      percent: { color: 'blue' as const, label: t('taxes.types.percent') },
      amount: { color: 'green' as const, label: t('taxes.types.amount') },
    };
    return <Badge color={config[type].color}>{config[type].label}</Badge>;
  };

  const getTaxByCategory = (category: TaxCategory) => {
    return taxes?.find(tax => tax.category === category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('taxes.title')}</h1>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowStatsModal(true)}
          >
            <BarChart3 size={20} />
            {t('taxes.statistics')}
          </Button>
        </div>
      </div>

      {/* Tax Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['service', 'delivery', 'custom'] as TaxCategory[]).map((category) => {
          const tax = getTaxByCategory(category);
          return (
            <Card key={category}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Settings className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className={isRTL ? 'mr-4' : 'ml-4'}>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t(`taxes.categories.${category}`)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t(`taxes.categories.${category}Description`)}
                      </p>
                    </div>
                  </div>
                  {getCategoryBadge(category)}
                </div>

                {tax ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{t('taxes.name')}</span>
                      <span className="text-sm text-gray-900">{tax.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{t('taxes.amount')}</span>
                      <span className="text-sm text-gray-900">
                        {tax.amount}{tax.type === 'percent' ? '%' : ' SAR'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{t('taxes.type')}</span>
                      {getTypeBadge(tax.type)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{t('common.status')}</span>
                      <Badge color={tax.status === 'active' ? 'green' : 'gray'}>
                        {t(`common.${tax.status}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{t('common.date')}</span>
                      <span className="text-sm text-gray-900">
                        {new Date(tax.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenModal(category, tax)}
                        className="flex-1"
                      >
                        <Edit2 size={16} />
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(tax.id)}
                        className="flex-1"
                      >
                        <Trash2 size={16} />
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">{t('taxes.noTaxConfigured')}</p>
                    <Button
                      onClick={() => handleOpenModal(category)}
                      className="w-full"
                    >
                      <Plus size={16} />
                      {t('taxes.configureTax')}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingTax ? t('taxes.edit') : t('taxes.configureTax')}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('taxes.category')}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Tax['category'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                disabled={!!editingTax} // Don't allow changing category when editing
              >
                <option value="service">{t('taxes.categories.service')}</option>
                <option value="delivery">{t('taxes.categories.delivery')}</option>
                <option value="custom">{t('taxes.categories.custom')}</option>
              </select>
            </div>

            <Input
              label={t('taxes.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('taxes.namePlaceholder')}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('taxes.type')}
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Tax['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="percent">{t('taxes.types.percent')}</option>
                <option value="amount">{t('taxes.types.amount')}</option>
              </select>
            </div>

            <Input
              label={t('taxes.amount')}
              type="number"
              step="0.1"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder={formData.type === 'percent' ? "15.0" : "25.0"}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.status')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Tax['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="flex-1">
                {editingTax ? t('common.update') : t('taxes.configureTax')}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Statistics Modal */}
      {showStatsModal && (
        <Modal
          isOpen={showStatsModal}
          onClose={handleCloseStatsModal}
          title={t('taxes.statistics')}
          size="lg"
        >
          {statistics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">{t('taxes.totalTaxes')}</h3>
                  <p className="text-2xl font-bold text-primary-600">{statistics.total}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">{t('taxes.breakdown')}</h3>
                  <p className="text-sm text-gray-600">{t('taxes.byType')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">{t('taxes.breakdown')}</h3>
                {statistics.byType.map((typeData) => (
                  <div key={typeData.type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{t(`taxes.types.${typeData.type}`)}</span>
                    <Badge color="blue">{typeData.count}</Badge>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="secondary" onClick={handleCloseStatsModal}>
                  {t('common.close')}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
