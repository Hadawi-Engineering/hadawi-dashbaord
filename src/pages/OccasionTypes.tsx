import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Eye, BarChart3 } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import OccasionTypeForm from '../components/OccasionTypeForm';
import { useLanguage } from '../contexts/LanguageContext';
import type { OccasionType, OccasionTypeFormData } from '../types';

export default function OccasionTypes() {
  const { t, isRTL } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<OccasionType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const queryClient = useQueryClient();

  // Fetch occasion types
  const { data: occasionTypes, isLoading } = useQuery({
    queryKey: ['occasion-types'],
    queryFn: () => adminService.getOccasionTypes(),
  });


  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: OccasionTypeFormData) => adminService.createOccasionType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasion-types'] });
      handleCloseModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OccasionTypeFormData> }) =>
      adminService.updateOccasionType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasion-types'] });
      handleCloseModal();
    },
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminService.toggleOccasionTypeActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasion-types'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteOccasionType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasion-types'] });
    },
  });

  const handleOpenModal = (type?: OccasionType) => {
    if (type) {
      setEditingType(type);
    } else {
      setEditingType(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingType(null);
  };

  const handleSubmit = async (formData: OccasionTypeFormData) => {
    try {
      if (editingType) {
        await updateMutation.mutateAsync({ id: editingType.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleMutation.mutateAsync(id);
    } catch (error) {
      alert(t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('occasionTypes.deleteConfirm'))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert(t('common.error'));
      }
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge color={isActive ? 'green' : 'gray'}>
        {isActive ? t('common.active') : t('common.inactive')}
      </Badge>
    );
  };

  const filteredTypes = occasionTypes?.filter((type) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      type.nameEn.toLowerCase().includes(searchLower) ||
      type.nameAr.toLowerCase().includes(searchLower) ||
      type.descriptionEn?.toLowerCase().includes(searchLower) ||
      type.descriptionAr?.toLowerCase().includes(searchLower) ||
      type.key.toLowerCase().includes(searchLower);

    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && type.isActive) ||
      (filterActive === 'inactive' && !type.isActive);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('occasionTypes.title')}</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} />
          {t('occasionTypes.add')}
        </Button>
      </div>

      {/* Statistics Cards */}
      {occasionTypes && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-primary-600" />
                </div>
                <div className={isRTL ? 'mr-4' : 'ml-4'}>
                  <p className="text-sm font-medium text-gray-600">{t('occasionTypes.totalTypes')}</p>
                  <p className="text-2xl font-bold text-gray-900">{occasionTypes.length}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ToggleRight className="w-6 h-6 text-green-600" />
                </div>
                <div className={isRTL ? 'mr-4' : 'ml-4'}>
                  <p className="text-sm font-medium text-gray-600">{t('occasionTypes.activeTypes')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {occasionTypes.filter(type => type.isActive).length}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div className={isRTL ? 'mr-4' : 'ml-4'}>
                  <p className="text-sm font-medium text-gray-600">{t('occasionTypes.inactiveTypes')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {occasionTypes.filter(type => !type.isActive).length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('occasionTypes.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterActive === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterActive('all')}
              >
                {t('common.all')}
              </Button>
              <Button
                variant={filterActive === 'active' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterActive('active')}
              >
                {t('common.active')}
              </Button>
              <Button
                variant={filterActive === 'inactive' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterActive('inactive')}
              >
                {t('common.inactive')}
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
              <Table.Th>{t('occasionTypes.key')}</Table.Th>
              <Table.Th>{t('occasionTypes.name')}</Table.Th>
              <Table.Th>{t('occasionTypes.description')}</Table.Th>
              <Table.Th>{t('common.status')}</Table.Th>
              <Table.Th>{t('common.date')}</Table.Th>
              <Table.Th>{t('common.actions')}</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredTypes?.map((type) => (
              <Table.Row key={type.id}>
                <Table.Td>
                  <div className="font-mono text-sm text-gray-900">{type.key}</div>
                </Table.Td>
                <Table.Td>
                  <div className="font-medium text-gray-900">{type.nameEn}</div>
                  <div className="text-xs text-gray-500" dir="rtl">{type.nameAr}</div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600 text-sm line-clamp-2">{type.descriptionEn}</div>
                  <div className="text-gray-500 text-xs line-clamp-2" dir="rtl">{type.descriptionAr}</div>
                </Table.Td>
                <Table.Td>
                  {getStatusBadge(type.isActive)}
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">
                    {new Date(type.createdAt).toLocaleDateString()}
                  </div>
                </Table.Td>
                <Table.Td>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenModal(type)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(type.id)}
                    >
                      {type.isActive ? (
                        <ToggleRight size={16} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={16} className="text-gray-400" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(type.id)}
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
        <OccasionTypeForm
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          initialData={editingType}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      )}

    </div>
  );
}
