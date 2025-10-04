import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Eye, Edit, Trash2, Calendar, MapPin, User, Phone, Package } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import DeliveryDetailsModal from '../components/DeliveryDetailsModal';
import type { DeliveryRecord } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function DeliveryRecords() {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);

  // Fetch delivery records
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['delivery-records', page, search, statusFilter],
    queryFn: () => adminService.getDeliveryRecords({ 
      page, 
      limit: 20, 
      search,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteDeliveryRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-records'] });
    },
  });

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const handleViewDelivery = (delivery: DeliveryRecord) => {
    setSelectedDelivery(delivery);
    setDeliveryModalOpen(true);
  };

  const handleEditDelivery = (delivery: DeliveryRecord) => {
    setSelectedDelivery(delivery);
    setDeliveryModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('delivery.deleteConfirm'))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert(t('common.error'));
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { color: 'yellow', text: t('delivery.statuses.pending') },
      in_transit: { color: 'blue', text: t('delivery.statuses.in_transit') },
      delivered: { color: 'green', text: t('delivery.statuses.delivered') },
      failed: { color: 'red', text: t('delivery.statuses.failed') },
      cancelled: { color: 'gray', text: t('delivery.statuses.cancelled') },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'gray', text: status };
    return <Badge color={statusInfo.color as any}>{statusInfo.text}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('delivery.title')}</h1>
        <div className="text-sm text-gray-500">
          {t('delivery.count')}: {deliveries?.length || 0}
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              placeholder={t('delivery.searchPlaceholder')}
              onSearch={handleSearch}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'in_transit', 'delivered', 'failed', 'cancelled'].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? 'primary' : 'secondary'}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
              >
                {status === 'all' ? t('common.all') : t(`delivery.statuses.${status}`)}
              </Button>
            ))}
          </div>
        </div>

        <Table loading={isLoading}>
          <Table.Head>
            <Table.Row>
              <Table.Th>{t('delivery.occasion')}</Table.Th>
              <Table.Th>{t('delivery.deliveryPartner')}</Table.Th>
              <Table.Th>{t('delivery.recipientName')}</Table.Th>
              <Table.Th>{t('delivery.deliveryDate')}</Table.Th>
              <Table.Th>{t('delivery.status')}</Table.Th>
              <Table.Th>{t('common.actions')}</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {deliveries?.map((delivery) => (
              <Table.Row key={delivery.id}>
                <Table.Td>
                  <div className="font-medium text-gray-900">
                    {delivery.occasion?.occasionName || '-'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {delivery.occasion?.occasionType || '-'}
                  </div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-900">
                    {delivery.deliveryPartner?.name || '-'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {delivery.deliveryPartner?.phone || '-'}
                  </div>
                </Table.Td>
                <Table.Td>
                  <div className="font-medium text-gray-900">
                    {delivery.recipientName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {delivery.recipientPhone}
                  </div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">
                    {new Date(delivery.deliveryDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(delivery.deliveryDate).toLocaleTimeString()}
                  </div>
                </Table.Td>
                <Table.Td>
                  {getStatusBadge(delivery.status)}
                </Table.Td>
                <Table.Td>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewDelivery(delivery)}
                      title={t('delivery.viewDelivery')}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditDelivery(delivery)}
                      title={t('delivery.editDelivery')}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(delivery.id)}
                      title={t('delivery.deleteDelivery')}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Table.Td>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {deliveries && deliveries.length >= 20 && (
          <Pagination
            currentPage={page}
            totalPages={Math.max(page + 1, 10)}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* Delivery Details Modal */}
      {selectedDelivery && (
        <DeliveryDetailsModal
          isOpen={deliveryModalOpen}
          onClose={() => {
            setDeliveryModalOpen(false);
            setSelectedDelivery(null);
          }}
          occasionId={selectedDelivery.occasionId}
          occasionName={selectedDelivery.occasion?.occasionName || ''}
          existingDelivery={selectedDelivery}
        />
      )}
    </div>
  );
}
