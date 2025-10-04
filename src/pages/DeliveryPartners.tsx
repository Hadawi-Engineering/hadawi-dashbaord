import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Eye, Edit, Trash2, ToggleLeft, ToggleRight, MapPin, Star, Truck, Users, Activity, Wifi, WifiOff } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import type { DeliveryPartner, DeliveryPartnerCreate, DeliveryPartnerUpdate, DeliveryPartnerStatistics } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function DeliveryPartners() {
  const { t, isRTL } = useLanguage();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [onlineFilter, setOnlineFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<DeliveryPartner | null>(null);
  const [viewingPartner, setViewingPartner] = useState<DeliveryPartner | null>(null);
  const queryClient = useQueryClient();

  // Fetch delivery partners
  const { data: partnersData, isLoading: isLoadingPartners } = useQuery({
    queryKey: ['delivery-partners', page, search, statusFilter, activeFilter, onlineFilter],
    queryFn: () => adminService.getDeliveryPartners({
      page,
      limit: 20,
      search,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      isActive: activeFilter !== 'all' ? activeFilter === 'active' : undefined,
      isOnline: onlineFilter !== 'all' ? onlineFilter === 'online' : undefined,
    }),
  });

  // Fetch statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery<DeliveryPartnerStatistics>({
    queryKey: ['delivery-partner-statistics'],
    queryFn: () => adminService.getDeliveryPartnerStatistics(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: DeliveryPartnerCreate) => adminService.createDeliveryPartner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-partner-statistics'] });
      setModalOpen(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeliveryPartnerUpdate }) => 
      adminService.updateDeliveryPartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-partner-statistics'] });
      setModalOpen(false);
      setEditingPartner(null);
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => adminService.toggleDeliveryPartnerActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-partner-statistics'] });
    },
  });

  // Toggle online mutation
  const toggleOnlineMutation = useMutation({
    mutationFn: ({ id, isOnline }: { id: string; isOnline: boolean }) => 
      adminService.updateDeliveryPartnerOnlineStatus(id, isOnline),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-partner-statistics'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteDeliveryPartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-partner-statistics'] });
    },
  });

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const handleAddPartner = () => {
    setEditingPartner(null);
    setModalOpen(true);
  };

  const handleEditPartner = (partner: DeliveryPartner) => {
    setEditingPartner(partner);
    setModalOpen(true);
  };

  const handleViewPartner = (partner: DeliveryPartner) => {
    setViewingPartner(partner);
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleActiveMutation.mutateAsync(id);
    } catch (error) {
      alert(t('common.error'));
    }
  };

  const handleToggleOnline = async (id: string, currentStatus: boolean) => {
    try {
      await toggleOnlineMutation.mutateAsync({ id, isOnline: !currentStatus });
    } catch (error) {
      alert(t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('deliveryPartners.deleteConfirm'))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert(t('common.error'));
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { color: 'green', text: t('deliveryPartners.statuses.available') },
      busy: { color: 'yellow', text: t('deliveryPartners.statuses.busy') },
      offline: { color: 'gray', text: t('deliveryPartners.statuses.offline') },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'gray', text: status };
    return <Badge color={statusInfo.color as any}>{statusInfo.text}</Badge>;
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const partners = partnersData?.deliveryPartners || [];
  const pagination = partnersData?.pagination;

  const partnerColumns = [
    {
      key: 'partnerId',
      label: t('deliveryPartners.partnerId'),
      render: (partner: DeliveryPartner) => (
        <div className="font-medium text-gray-900">{partner.partnerId}</div>
      ),
    },
    {
      key: 'name',
      label: t('deliveryPartners.name'),
      render: (partner: DeliveryPartner) => (
        <div>
          <div className="font-medium text-gray-900">{partner.name}</div>
          <div className="text-sm text-gray-500">{partner.email}</div>
        </div>
      ),
    },
    {
      key: 'vehicle',
      label: t('deliveryPartners.vehicleModel'),
      render: (partner: DeliveryPartner) => (
        <div>
          <div className="font-medium text-gray-900">{partner.vehicleModel}</div>
          <div className="text-sm text-gray-500">{partner.vehiclePlateNumber}</div>
        </div>
      ),
    },
    {
      key: 'rating',
      label: t('deliveryPartners.rating'),
      render: (partner: DeliveryPartner) => (
        <div className="flex items-center gap-1">
          {getRatingStars(partner.rating)}
          <span className="text-sm text-gray-600 ml-1">({partner.rating})</span>
        </div>
      ),
    },
    {
      key: 'deliveries',
      label: t('deliveryPartners.totalDeliveries'),
      render: (partner: DeliveryPartner) => (
        <div className="text-center">
          <div className="font-medium text-gray-900">{partner.totalDeliveries}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: t('deliveryPartners.status'),
      render: (partner: DeliveryPartner) => getStatusBadge(partner.status),
    },
    {
      key: 'active',
      label: t('deliveryPartners.isActive'),
      render: (partner: DeliveryPartner) => (
        <div className="flex items-center gap-2">
          <Badge color={partner.isActive ? 'green' : 'gray'}>
            {partner.isActive ? t('common.active') : t('common.inactive')}
          </Badge>
          {partner.isOnline ? (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi size={14} />
              <span className="text-xs">{t('deliveryPartners.isOnline')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-500">
              <WifiOff size={14} />
              <span className="text-xs">{t('deliveryPartners.filterOffline')}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (partner: DeliveryPartner) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleViewPartner(partner)}
            title={t('deliveryPartners.viewPartner')}
          >
            <Eye size={16} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEditPartner(partner)}
            title={t('deliveryPartners.editPartner')}
          >
            <Edit size={16} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleToggleActive(partner.id)}
            title={t('deliveryPartners.toggleActive')}
          >
            {partner.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleToggleOnline(partner.id, partner.isOnline)}
            title={partner.isOnline ? t('deliveryPartners.setOffline') : t('deliveryPartners.setOnline')}
          >
            {partner.isOnline ? <WifiOff size={16} /> : <Wifi size={16} />}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(partner.id)}
            title={t('deliveryPartners.deletePartner')}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('deliveryPartners.title')}</h1>
        <Button onClick={handleAddPartner} className="flex items-center gap-2">
          <Plus size={16} />
          {t('deliveryPartners.add')}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('deliveryPartners.totalPartners')}</p>
              <p className="font-semibold text-gray-900">{stats?.totalPartners || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('deliveryPartners.activePartners')}</p>
              <p className="font-semibold text-gray-900">{stats?.activePartners || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wifi className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('deliveryPartners.onlinePartners')}</p>
              <p className="font-semibold text-gray-900">{stats?.onlinePartners || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('deliveryPartners.averageRating')}</p>
              <p className="font-semibold text-gray-900">{stats?.averageRating?.toFixed(1) || '0.0'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              placeholder={t('deliveryPartners.searchPlaceholder')}
              onSearch={handleSearch}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Status Filter */}
            <div className="flex gap-1">
              {['all', 'available', 'busy', 'offline'].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={statusFilter === status ? 'primary' : 'secondary'}
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                >
                  {status === 'all' ? t('common.all') : t(`deliveryPartners.statuses.${status}`)}
                </Button>
              ))}
            </div>
            {/* Active Filter */}
            <div className="flex gap-1">
              {['all', 'active', 'inactive'].map((active) => (
                <Button
                  key={active}
                  size="sm"
                  variant={activeFilter === active ? 'primary' : 'secondary'}
                  onClick={() => {
                    setActiveFilter(active);
                    setPage(1);
                  }}
                >
                  {active === 'all' ? t('common.all') : t(`common.${active}`)}
                </Button>
              ))}
            </div>
            {/* Online Filter */}
            <div className="flex gap-1">
              {['all', 'online', 'offline'].map((online) => (
                <Button
                  key={online}
                  size="sm"
                  variant={onlineFilter === online ? 'primary' : 'secondary'}
                  onClick={() => {
                    setOnlineFilter(online);
                    setPage(1);
                  }}
                >
                  {online === 'all' ? t('common.all') : t(`deliveryPartners.filter${online.charAt(0).toUpperCase() + online.slice(1)}`)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Partners Table */}
        <Table loading={isLoadingPartners}>
          <Table.Head>
            <Table.Row>
              {partnerColumns.map((column) => (
                <Table.Th key={column.key}>{column.label}</Table.Th>
              ))}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {partners.map((partner) => (
              <Table.Row key={partner.id}>
                {partnerColumns.map((column) => (
                  <Table.Td key={column.key}>
                    {column.render ? column.render(partner) : (partner as any)[column.key]}
                  </Table.Td>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.pages}
            onPageChange={setPage}
          />
        )}

        {/* Empty State */}
        {partners.length === 0 && !isLoadingPartners && (
          <div className="text-center py-8 text-gray-500">
            {t('deliveryPartners.noDeliveryPartners')}
          </div>
        )}
      </Card>

      {/* Add/Edit Partner Modal */}
      {modalOpen && (
        <DeliveryPartnerModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingPartner(null);
          }}
          partner={editingPartner}
          onSave={(data) => {
            if (editingPartner) {
              updateMutation.mutate({ id: editingPartner.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* View Partner Modal */}
      {viewingPartner && (
        <DeliveryPartnerViewModal
          isOpen={!!viewingPartner}
          onClose={() => setViewingPartner(null)}
          partner={viewingPartner}
        />
      )}
    </div>
  );
}

// Delivery Partner Modal Component
interface DeliveryPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner?: DeliveryPartner | null;
  onSave: (data: DeliveryPartnerCreate | DeliveryPartnerUpdate) => void;
  isLoading: boolean;
}

function DeliveryPartnerModal({ isOpen, onClose, partner, onSave, isLoading }: DeliveryPartnerModalProps) {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    partnerId: '',
    name: '',
    email: '',
    phone: '',
    vehicleModel: '',
    vehiclePlateNumber: '',
    vehicleInfo: {
      color: '',
      year: new Date().getFullYear(),
      insurance: 'Valid',
    },
    rating: 0,
    totalDeliveries: 0,
    isActive: true,
    isOnline: false,
    isAdmin: false,
    status: 'available' as const,
    deliveryZones: [] as string[],
  });

  React.useEffect(() => {
    if (partner) {
      setFormData({
        partnerId: partner.partnerId || '',
        name: partner.name || '',
        email: partner.email || '',
        phone: partner.phone || '',
        vehicleModel: partner.vehicleModel || '',
        vehiclePlateNumber: partner.vehiclePlateNumber || '',
        vehicleInfo: partner.vehicleInfo || {
          color: '',
          year: new Date().getFullYear(),
          insurance: 'Valid',
        },
        rating: partner.rating || 0,
        totalDeliveries: partner.totalDeliveries || 0,
        isActive: partner.isActive ?? true,
        isOnline: partner.isOnline ?? false,
        isAdmin: partner.isAdmin ?? false,
        status: partner.status || 'available',
        deliveryZones: partner.deliveryZones || [],
      });
    } else {
      setFormData({
        partnerId: '',
        name: '',
        email: '',
        phone: '',
        vehicleModel: '',
        vehiclePlateNumber: '',
        vehicleInfo: {
          color: '',
          year: new Date().getFullYear(),
          insurance: 'Valid',
        },
        rating: 0,
        totalDeliveries: 0,
        isActive: true,
        isOnline: false,
        isAdmin: false,
        status: 'available',
        deliveryZones: [],
      });
    }
  }, [partner]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('vehicleInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vehicleInfo: {
          ...prev.vehicleInfo,
          [field]: type === 'number' ? parseInt(value) || 0 : value,
        },
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDeliveryZoneChange = (zone: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      deliveryZones: checked 
        ? [...prev.deliveryZones, zone]
        : prev.deliveryZones.filter(z => z !== zone),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {partner ? t('deliveryPartners.edit') : t('deliveryPartners.add')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('deliveryPartners.partnerId')} *
              </label>
              <input
                type="text"
                name="partnerId"
                value={formData.partnerId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={t('deliveryPartners.partnerIdPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('deliveryPartners.name')} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={t('deliveryPartners.namePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('deliveryPartners.email')} *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={t('deliveryPartners.emailPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('deliveryPartners.phone')} *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={t('deliveryPartners.phonePlaceholder')}
              />
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('deliveryPartners.vehicleInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('deliveryPartners.vehicleModel')} *
                </label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t('deliveryPartners.vehicleModelPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('deliveryPartners.vehiclePlateNumber')} *
                </label>
                <input
                  type="text"
                  name="vehiclePlateNumber"
                  value={formData.vehiclePlateNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t('deliveryPartners.vehiclePlatePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('deliveryPartners.vehicleColor')} *
                </label>
                <input
                  type="text"
                  name="vehicleInfo.color"
                  value={formData.vehicleInfo.color}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t('deliveryPartners.vehicleColorPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('deliveryPartners.vehicleYear')} *
                </label>
                <input
                  type="number"
                  name="vehicleInfo.year"
                  value={formData.vehicleInfo.year}
                  onChange={handleInputChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t('deliveryPartners.vehicleYearPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('deliveryPartners.vehicleInsurance')} *
                </label>
                <select
                  name="vehicleInfo.insurance"
                  value={formData.vehicleInfo.insurance}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {[
                    'Valid',
                    'Expired', 
                    'Not Available'
                  ].map((option: string) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Performance Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('deliveryPartners.rating')}
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                max="5"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={t('deliveryPartners.ratingPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('deliveryPartners.totalDeliveries')}
              </label>
              <input
                type="number"
                name="totalDeliveries"
                value={formData.totalDeliveries}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={t('deliveryPartners.totalDeliveriesPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('deliveryPartners.status')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {[
                  'Available',
                  'Busy',
                  'Offline'
                ].map((option: string) => (
                  <option key={option} value={option.toLowerCase()}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery Zones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('deliveryPartners.deliveryZones')} *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'Riyadh',
                'Jeddah',
                'Dammam',
                'Mecca',
                'Medina',
                'Taif',
                'Buraidah',
                'Tabuk',
                'Khamis Mushait',
                'Hail'
              ].map((zone: string) => (
                <label key={zone} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.deliveryZones.includes(zone)}
                    onChange={(e) => handleDeliveryZoneChange(zone, e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{zone}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{t('deliveryPartners.isActive')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isOnline"
                checked={formData.isOnline}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{t('deliveryPartners.isOnline')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isAdmin"
                checked={formData.isAdmin}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{t('deliveryPartners.isAdmin')}</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="spinner" />
                  {t('common.loading')}
                </div>
              ) : (
                partner ? t('common.update') : t('deliveryPartners.createPartner')
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// Delivery Partner View Modal Component
interface DeliveryPartnerViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: DeliveryPartner;
}

function DeliveryPartnerViewModal({ isOpen, onClose, partner }: DeliveryPartnerViewModalProps) {
  const { t, isRTL } = useLanguage();

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { color: 'green', text: t('deliveryPartners.statuses.available') },
      busy: { color: 'yellow', text: t('deliveryPartners.statuses.busy') },
      offline: { color: 'gray', text: t('deliveryPartners.statuses.offline') },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'gray', text: status };
    return <Badge color={statusInfo.color as any}>{statusInfo.text}</Badge>;
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{t('deliveryPartners.viewPartner')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('deliveryPartners.name')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.partnerId')}</p>
                  <p className="font-medium text-gray-900">{partner.partnerId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.name')}</p>
                  <p className="font-medium text-gray-900">{partner.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.email')}</p>
                  <p className="font-medium text-gray-900">{partner.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.phone')}</p>
                  <p className="font-medium text-gray-900">{partner.phone}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('deliveryPartners.vehicleInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.vehicleModel')}</p>
                  <p className="font-medium text-gray-900">{partner.vehicleModel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.vehiclePlateNumber')}</p>
                  <p className="font-medium text-gray-900">{partner.vehiclePlateNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.vehicleColor')}</p>
                  <p className="font-medium text-gray-900">{partner.vehicleInfo?.color || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.vehicleYear')}</p>
                  <p className="font-medium text-gray-900">{partner.vehicleInfo?.year || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.vehicleInsurance')}</p>
                  <p className="font-medium text-gray-900">{partner.vehicleInfo?.insurance || 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Performance Information */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.rating')}</p>
                  <div className="flex items-center gap-2">
                    {getRatingStars(partner.rating || 0)}
                    <span className="text-sm text-gray-600">({partner.rating || 0})</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.totalDeliveries')}</p>
                  <p className="font-medium text-gray-900">{partner.totalDeliveries || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.status')}</p>
                  {getStatusBadge(partner.status)}
                </div>
              </div>
            </div>
          </Card>

          {/* Status Information */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.isActive')}</p>
                  <Badge color={partner.isActive ? 'green' : 'gray'}>
                    {partner.isActive ? t('common.active') : t('common.inactive')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.isOnline')}</p>
                  <Badge color={partner.isOnline ? 'green' : 'gray'}>
                    {partner.isOnline ? t('deliveryPartners.filterOnline') : t('deliveryPartners.filterOffline')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.isAdmin')}</p>
                  <Badge color={partner.isAdmin ? 'blue' : 'gray'}>
                    {partner.isAdmin ? t('deliveryPartners.isAdmin') : 'No'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('deliveryPartners.lastOnlineAt')}</p>
                  <p className="font-medium text-gray-900">
                    {partner.lastOnlineAt ? new Date(partner.lastOnlineAt).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Delivery Zones */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('deliveryPartners.deliveryZones')}</h3>
              <div className="flex flex-wrap gap-2">
                {partner.deliveryZones && partner.deliveryZones.length > 0 ? (
                  partner.deliveryZones.map((zone) => (
                    <Badge key={zone} color="blue">{zone}</Badge>
                  ))
                ) : (
                  <span className="text-gray-500">No delivery zones assigned</span>
                )}
              </div>
            </div>
          </Card>

          {/* Current Location */}
          {partner.currentLocation ? (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('deliveryPartners.currentLocation')}</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">{partner.currentLocation.address || 'N/A'}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Latitude</p>
                      <p className="font-medium text-gray-900">{partner.currentLocation.lat || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Longitude</p>
                      <p className="font-medium text-gray-900">{partner.currentLocation.lng || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('deliveryPartners.currentLocation')}</h3>
                <p className="text-gray-500">No location information available</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Modal>
  );
}