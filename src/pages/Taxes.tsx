import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, BarChart3, Calculator, Receipt } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useLanguage } from '../contexts/LanguageContext';
import type { Tax, TaxStatistics } from '../types';

type FilterType = 'all' | 'service' | 'delivery' | 'packaging' | 'custom';

export default function Taxes() {
  const { t, isRTL } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    type: 'service' as Tax['type'],
    amount: 0,
  });

  // Fetch taxes
  const { data: taxes, isLoading } = useQuery({
    queryKey: ['taxes', filterType],
    queryFn: () => {
      if (filterType === 'all') {
        return adminService.getTaxes();
      }
      return adminService.getTaxesByType(filterType);
    },
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

  const handleOpenModal = (tax?: Tax) => {
    if (tax) {
      setEditingTax(tax);
      setFormData({
        name: tax.name,
        type: tax.type,
        amount: tax.amount,
      });
    } else {
      setEditingTax(null);
      setFormData({
        name: '',
        type: 'service',
        amount: 0,
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

  const getTypeBadge = (type: Tax['type']) => {
    const config = {
      service: { color: 'blue' as const, label: t('taxes.types.service') },
      delivery: { color: 'green' as const, label: t('taxes.types.delivery') },
      packaging: { color: 'purple' as const, label: t('taxes.types.packaging') },
      custom: { color: 'gray' as const, label: t('taxes.types.custom') },
    };
    return <Badge color={config[type].color}>{config[type].label}</Badge>;
  };

  const filteredTaxes = taxes?.filter((tax) => {
    const matchesSearch =
      tax.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tax.type.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

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
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} />
            {t('taxes.add')}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Calculator className="w-6 h-6 text-primary-600" />
                </div>
                <div className={isRTL ? 'mr-4' : 'ml-4'}>
                  <p className="text-sm font-medium text-gray-600">{t('taxes.totalTaxes')}</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                </div>
              </div>
            </div>
          </Card>

          {statistics.byType.map((typeData) => (
            <Card key={typeData.type}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Receipt className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className={isRTL ? 'mr-4' : 'ml-4'}>
                    <p className="text-sm font-medium text-gray-600">
                      {t(`taxes.types.${typeData.type}`)}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{typeData.count}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="text"
              placeholder={t('taxes.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'primary' : 'secondary'}
                onClick={() => setFilterType('all')}
              >
                {t('common.all')}
              </Button>
              <Button
                variant={filterType === 'service' ? 'primary' : 'secondary'}
                onClick={() => setFilterType('service')}
              >
                {t('taxes.types.service')}
              </Button>
              <Button
                variant={filterType === 'delivery' ? 'primary' : 'secondary'}
                onClick={() => setFilterType('delivery')}
              >
                {t('taxes.types.delivery')}
              </Button>
              <Button
                variant={filterType === 'packaging' ? 'primary' : 'secondary'}
                onClick={() => setFilterType('packaging')}
              >
                {t('taxes.types.packaging')}
              </Button>
              <Button
                variant={filterType === 'custom' ? 'primary' : 'secondary'}
                onClick={() => setFilterType('custom')}
              >
                {t('taxes.types.custom')}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table loading={isLoading}>
          <Table.Head>
            <Table.Row>
              <Table.Th>{t('taxes.name')}</Table.Th>
              <Table.Th>{t('taxes.type')}</Table.Th>
              <Table.Th>{t('taxes.amount')}</Table.Th>
              <Table.Th>{t('common.date')}</Table.Th>
              <Table.Th>{t('common.actions')}</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredTaxes?.map((tax) => (
              <Table.Row key={tax.id}>
                <Table.Td>
                  <div className="font-medium text-gray-900">{tax.name}</div>
                </Table.Td>
                <Table.Td>
                  {getTypeBadge(tax.type)}
                </Table.Td>
                <Table.Td>
                  <div className="font-medium text-gray-900">{tax.amount}%</div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">
                    {new Date(tax.createdAt).toLocaleDateString()}
                  </div>
                </Table.Td>
                <Table.Td>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenModal(tax)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(tax.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Table.Td>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingTax ? t('taxes.edit') : t('taxes.add')}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <option value="service">{t('taxes.types.service')}</option>
                <option value="delivery">{t('taxes.types.delivery')}</option>
                <option value="packaging">{t('taxes.types.packaging')}</option>
                <option value="custom">{t('taxes.types.custom')}</option>
              </select>
            </div>

            <Input
              label={t('taxes.amount')}
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="15.0"
              required
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="flex-1">
                {editingTax ? t('common.update') : t('common.add')}
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
