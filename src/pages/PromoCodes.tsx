import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import type { PromoCode } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function PromoCodes() {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    maxUsage: '',
    expiryDate: '',
    isActive: true,
  });
  const queryClient = useQueryClient();

  // Fetch promo codes
  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ['promo-codes'],
    queryFn: () => adminService.getPromoCodes(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createPromoCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      handleCloseModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminService.updatePromoCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      handleCloseModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deletePromoCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });

  const handleOpenModal = (code?: PromoCode) => {
    if (code) {
      setEditingCode(code);
      setFormData({
        code: code.code,
        discount: code.discount.toString(),
        maxUsage: code.maxUsage.toString(),
        expiryDate: code.expiryDate.split('T')[0],
        isActive: code.isActive,
      });
    } else {
      setEditingCode(null);
      setFormData({
        code: '',
        discount: '',
        maxUsage: '',
        expiryDate: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCode(null);
    setFormData({
      code: '',
      discount: '',
      maxUsage: '',
      expiryDate: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      code: formData.code,
      discount: Number(formData.discount),
      maxUsage: Number(formData.maxUsage),
      expiryDate: formData.expiryDate,
      isActive: formData.isActive,
    };

    try {
      if (editingCode) {
        await updateMutation.mutateAsync({ id: editingCode.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      alert(t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('promo.deleteConfirm'))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert(t('common.error'));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('promo.title')}</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} />
          {t('promo.add')}
        </Button>
      </div>

      <Card>
        <Table loading={isLoading}>
          <Table.Head>
            <Table.Row>
              <Table.Th>{t('promo.code')}</Table.Th>
              <Table.Th>{t('promo.discount')}</Table.Th>
              <Table.Th>{t('promo.usage')}</Table.Th>
              <Table.Th>{t('promo.remaining')}</Table.Th>
              <Table.Th>{t('promo.expiry')}</Table.Th>
              <Table.Th>{t('common.status')}</Table.Th>
              <Table.Th>{t('common.actions')}</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {promoCodes?.map((code) => {
              const remaining = code.maxUsage - code.usedCount;
              const isExpired = new Date(code.expiryDate) < new Date();
              
              return (
                <Table.Row key={code.id}>
                  <Table.Td>
                    <span className="font-mono font-bold text-primary-600">
                      {code.code}
                    </span>
                  </Table.Td>
                  <Table.Td>
                    <span className="font-medium">{code.discount}%</span>
                  </Table.Td>
                  <Table.Td>
                    <span className="text-gray-600">{code.usedCount}</span>
                  </Table.Td>
                  <Table.Td>
                    <span className={remaining > 0 ? 'text-green-600' : 'text-red-600'}>
                      {remaining}
                    </span>
                  </Table.Td>
                  <Table.Td>
                    <span className={isExpired ? 'text-red-600' : 'text-gray-600'}>
                      {new Date(code.expiryDate).toLocaleDateString()}
                    </span>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={code.isActive && !isExpired ? 'green' : 'red'}>
                      {code.isActive && !isExpired ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenModal(code)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(code.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </Table.Td>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingCode ? t('common.edit') : t('promo.add')}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('promo.code')}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="SUMMER2025"
              required
              disabled={!!editingCode}
            />

            <Input
              label={t('promo.discount') + ' (%)'}
              type="number"
              min="1"
              max="100"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              required
            />

            <Input
              label={t('promo.maxUses')}
              type="number"
              min="1"
              value={formData.maxUsage}
              onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
              required
            />

            <Input
              label={t('promo.expiry')}
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              required
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                {t('common.active')}
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="flex-1">
                {editingCode ? t('common.update') : t('common.add')}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
