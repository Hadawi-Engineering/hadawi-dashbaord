import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Eye, BarChart3 } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useLanguage } from '../contexts/LanguageContext';

interface OccasionType {
  id: string;
  key: string;
  value: string; // Arabic name
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function OccasionTypes() {
  const { t, isRTL } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<OccasionType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    isActive: true,
  });
  const queryClient = useQueryClient();

  // Fetch occasion types
  const { data: occasionTypes, isLoading } = useQuery({
    queryKey: ['occasion-types', filterActive],
    queryFn: () => {
      if (filterActive === 'active') {
        return adminService.getActiveOccasionTypes();
      }
      return adminService.getOccasionTypes();
    },
  });


  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createOccasionType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasion-types'] });
      handleCloseModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
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
      setFormData({
        key: type.key,
        value: type.value,
        description: type.description,
        isActive: type.isActive,
      });
    } else {
      setEditingType(null);
      setFormData({
        key: '',
        value: '',
        description: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingType) {
        await updateMutation.mutateAsync({ id: editingType.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      alert(t('common.error'));
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
    const matchesSearch = 
      type.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.key.toLowerCase().includes(searchTerm.toLowerCase());
    
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
              <Table.Th>{t('occasionTypes.value')}</Table.Th>
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
                  <div className="font-medium text-gray-900">{type.value}</div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">{type.description}</div>
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
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingType ? t('occasionTypes.edit') : t('occasionTypes.add')}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Input
                label={t('occasionTypes.key')}
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="birthday"
                required
              />

              <Input
                label={t('occasionTypes.value')}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="عيد ميلاد"
                required
              />

              <Input
                label={t('occasionTypes.description')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Birthday celebrations"
                multiline
                rows={3}
              />
            </div>

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
                {editingType ? t('common.update') : t('common.add')}
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
