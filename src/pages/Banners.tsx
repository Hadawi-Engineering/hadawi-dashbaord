import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ImageUploader from '../components/ui/ImageUploader';
import type { Banner } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function Banners() {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    bannerName: '',
    icon: '',
    buttonText: '',
    imageUrl: '',
    actionUrl: '',
    isActive: true,
  });
  const queryClient = useQueryClient();

  // Fetch banners
  const { data: banners, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: () => adminService.getBanners(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      handleCloseModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminService.updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      handleCloseModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });

  const handleOpenModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        bannerName: banner.bannerName,
        icon: banner.icon || '',
        buttonText: banner.buttonText || '',
        imageUrl: banner.imageUrl,
        actionUrl: banner.actionUrl || '',
        isActive: banner.isActive,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        bannerName: '',
        icon: '',
        buttonText: '',
        imageUrl: '',
        actionUrl: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBanner) {
        await updateMutation.mutateAsync({ id: editingBanner.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      alert(t('common.error'));
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { isActive: !currentStatus },
      });
    } catch (error) {
      alert(t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('banners.deleteConfirm'))) {
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
        <h1 className="text-3xl font-bold text-gray-900">{t('banners.title')}</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} />
          {t('banners.add')}
        </Button>
      </div>

      <Card>
        <Table loading={isLoading}>
          <Table.Head>
            <Table.Row>
              <Table.Th>{t('banners.title')}</Table.Th>
              <Table.Th>{t('common.name')}</Table.Th>
              <Table.Th>{t('banners.image')}</Table.Th>
              <Table.Th>{t('banners.buttonText')}</Table.Th>
              <Table.Th>{t('common.status')}</Table.Th>
              <Table.Th>{t('common.date')}</Table.Th>
              <Table.Th>{t('common.actions')}</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {banners?.map((banner) => (
              <Table.Row key={banner.id}>
                <Table.Td>
                  <div className="font-medium text-gray-900">{banner.title}</div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">{banner.bannerName}</div>
                </Table.Td>
                <Table.Td>
                  {banner.imageUrl ? (
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-2xl">{banner.icon || '🖼️'}</span>
                    </div>
                  )}
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">{banner.buttonText || '-'}</div>
                </Table.Td>
                <Table.Td>
                  <Badge color={banner.isActive ? 'green' : 'gray'}>
                    {banner.isActive ? t('common.active') : t('common.inactive')}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">
                    {new Date(banner.createdAt).toLocaleDateString()}
                  </div>
                </Table.Td>
                <Table.Td>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenModal(banner)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(banner.id, banner.isActive)}
                    >
                      {banner.isActive ? (
                        <ToggleRight size={16} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={16} className="text-gray-400" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(banner.id)}
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
          title={editingBanner ? t('common.edit') : t('banners.add')}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('banners.titleEnglish')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('banners.titleEnglishPlaceholder')}
                required
              />

              <Input
                label={t('banners.titleArabic')}
                value={formData.bannerName}
                onChange={(e) => setFormData({ ...formData, bannerName: e.target.value })}
                placeholder={t('banners.titleArabicPlaceholder')}
                required
              />

              <Input
                label={t('banners.icon')}
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder={t('banners.iconPlaceholder')}
              />

              <Input
                label={t('banners.buttonText')}
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder={t('banners.buttonTextPlaceholder')}
              />
            </div>

            <ImageUploader
              label={t('banners.image')}
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              maxSize={10}
            />

            <Input
              label={t('banners.actionUrl')}
              value={formData.actionUrl}
              onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
              placeholder={t('banners.actionUrlPlaceholder')}
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
                {editingBanner ? t('common.update') : t('common.add')}
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
