import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, BarChart3, Package, Image as ImageIcon, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import PackagingForm from '../components/PackagingForm';
import { useLanguage } from '../contexts/LanguageContext';
import type { PackagingType, PackagingFormData } from '../types';

type FilterStatus = 'all' | 'active' | 'inactive' | 'archived';

export default function Packaging() {
  const { t, isRTL } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState<PackagingType | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const queryClient = useQueryClient();

  // Fetch packaging types
  const { data: packagingTypes, isLoading } = useQuery({
    queryKey: ['packaging-types', filterStatus],
    queryFn: () => {
      if (filterStatus === 'all') {
        return adminService.getPackagingTypes();
      }
      return adminService.getPackagingTypesByStatus(filterStatus);
    },
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['packaging-statistics'],
    queryFn: () => adminService.getPackagingStatistics(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: PackagingFormData) =>
      adminService.createPackagingType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging-types'] });
      queryClient.invalidateQueries({ queryKey: ['packaging-statistics'] });
      handleCloseModal();
      alert(t('packaging.packagingCreated'));
    },
    onError: () => alert(t('common.error')),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PackagingFormData> }) =>
      adminService.updatePackagingType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging-types'] });
      queryClient.invalidateQueries({ queryKey: ['packaging-statistics'] });
      handleCloseModal();
      alert(t('packaging.packagingUpdated'));
    },
    onError: () => alert(t('common.error')),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PackagingType['status'] }) =>
      adminService.updatePackagingTypeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging-types'] });
      queryClient.invalidateQueries({ queryKey: ['packaging-statistics'] });
    },
    onError: () => alert(t('common.error')),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deletePackagingType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging-types'] });
      queryClient.invalidateQueries({ queryKey: ['packaging-statistics'] });
      alert(t('packaging.packagingDeleted'));
    },
    onError: () => alert(t('common.error')),
  });

  const handleOpenModal = (packaging?: PackagingType) => {
    if (packaging) {
      setEditingPackaging(packaging);
    } else {
      setEditingPackaging(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPackaging(null);
  };

  const handleCloseStatsModal = () => {
    setShowStatsModal(false);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImages([]);
  };

  const handleSubmit = async (formData: PackagingFormData) => {
    try {
      if (editingPackaging) {
        await updateMutation.mutateAsync({ id: editingPackaging.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('packaging.deleteConfirm'))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: PackagingType['status']) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleViewImages = (images: string[]) => {
    setSelectedImages(images);
    setShowImageModal(true);
  };

  const getStatusBadge = (status: PackagingType['status']) => {
    const config = {
      active: { color: 'green' as const, label: t('common.active') },
      inactive: { color: 'gray' as const, label: t('common.inactive') },
      archived: { color: 'red' as const, label: t('packaging.archived') },
    };
    return <Badge color={config[status].color}>{config[status].label}</Badge>;
  };

  const filteredPackaging = packagingTypes?.filter((packaging) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      packaging.nameEn.toLowerCase().includes(searchLower) ||
      packaging.nameAr.toLowerCase().includes(searchLower) ||
      packaging.descriptionEn?.toLowerCase().includes(searchLower) ||
      packaging.descriptionAr?.toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('packaging.title')}</h1>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowStatsModal(true)}
          >
            <BarChart3 size={20} />
            {t('packaging.statistics')}
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} />
            {t('packaging.add')}
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
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <div className={isRTL ? 'mr-4' : 'ml-4'}>
                  <p className="text-sm font-medium text-gray-600">{t('packaging.totalPackaging')}</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                </div>
              </div>
            </div>
          </Card>

          {statistics.byStatus.map((statusData) => (
            <Card key={statusData.status}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className={isRTL ? 'mr-4' : 'ml-4'}>
                    <p className="text-sm font-medium text-gray-600">
                      {t(`packaging.status.${statusData.status}`)}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{statusData.count}</p>
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
              placeholder={t('packaging.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus('all')}
              >
                {t('common.all')}
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus('active')}
              >
                {t('common.active')}
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus('inactive')}
              >
                {t('common.inactive')}
              </Button>
              <Button
                variant={filterStatus === 'archived' ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus('archived')}
              >
                {t('packaging.archived')}
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
              <Table.Th>{t('packaging.name')}</Table.Th>
              <Table.Th>{t('packaging.images')}</Table.Th>
              <Table.Th>{t('packaging.amount')}</Table.Th>
              <Table.Th>{t('packaging.giftType')}</Table.Th>
              <Table.Th>{t('common.status')}</Table.Th>
              <Table.Th>{t('common.date')}</Table.Th>
              <Table.Th>{t('common.actions')}</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredPackaging?.map((packaging) => (
              <Table.Row key={packaging.id}>
                <Table.Td>
                  <div className="font-medium text-gray-900">{packaging.nameEn}</div>
                  <div className="text-xs text-gray-500" dir="rtl">{packaging.nameAr}</div>
                </Table.Td>
                <Table.Td>
                  <div className="flex items-center gap-2">
                    {packaging.images.length > 0 ? (
                      <>
                        <img
                          src={packaging.images[0]}
                          alt={packaging.nameEn}
                          className="w-12 h-12 object-cover rounded"
                        />
                        {packaging.images.length > 1 && (
                          <span className="text-sm text-gray-500">
                            +{packaging.images.length - 1}
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewImages(packaging.images)}
                        >
                          <Eye size={16} />
                        </Button>
                      </>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </Table.Td>
                <Table.Td>
                  <div className="font-medium text-gray-900">{packaging.amount} SAR</div>
                </Table.Td>
                <Table.Td>
                  <Badge color={packaging.giftType === 'money' ? 'blue' : 'green'}>
                    {t(`packaging.giftTypeOptions.${packaging.giftType}`)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {getStatusBadge(packaging.status)}
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">
                    {new Date(packaging.createdAt).toLocaleDateString()}
                  </div>
                </Table.Td>
                <Table.Td>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenModal(packaging)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(packaging.id, packaging.status)}
                    >
                      {packaging.status === 'active' ? (
                        <ToggleRight size={16} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={16} className="text-gray-400" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(packaging.id)}
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
        <PackagingForm
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          initialData={editingPackaging}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Image Gallery Modal */}
      {showImageModal && (
        <Modal
          isOpen={showImageModal}
          onClose={handleCloseImageModal}
          title={t('packaging.imageGallery')}
          size="lg"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="secondary" onClick={handleCloseImageModal}>
              {t('common.close')}
            </Button>
          </div>
        </Modal>
      )}

      {/* Statistics Modal */}
      {showStatsModal && (
        <Modal
          isOpen={showStatsModal}
          onClose={handleCloseStatsModal}
          title={t('packaging.statistics')}
          size="lg"
        >
          {statistics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">{t('packaging.totalPackaging')}</h3>
                  <p className="text-2xl font-bold text-primary-600">{statistics.total}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">{t('packaging.totalAmount')}</h3>
                  <p className="text-2xl font-bold text-green-600">{statistics.totalAmount} SAR</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">{t('packaging.breakdown')}</h3>
                {statistics.byStatus.map((statusData) => (
                  <div key={statusData.status} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{t(`packaging.status.${statusData.status}`)}</span>
                    <Badge color="blue">{statusData.count}</Badge>
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
