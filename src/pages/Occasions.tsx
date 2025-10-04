import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, ToggleLeft, ToggleRight, Truck } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import DeliveryDetailsModal from '../components/DeliveryDetailsModal';
import type { Occasion } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function Occasions() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<{ id: string; name: string } | null>(null);
  const queryClient = useQueryClient();

  // Fetch occasions
  const { data: occasions, isLoading } = useQuery({
    queryKey: ['occasions', page, search, statusFilter],
    queryFn: () => adminService.getOccasions({ 
      page, 
      limit: 20, 
      search,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Occasion> }) =>
      adminService.updateOccasion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteOccasion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
    },
  });

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const handleViewOccasion = (id: string) => {
    navigate(`/occasions/${id}`);
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
    if (confirm(t('occasions.deleteConfirm'))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert(t('common.error'));
      }
    }
  };

  const handleDeliveryDetails = (occasion: Occasion) => {
    setSelectedOccasion({ id: occasion.id, name: occasion.occasionName });
    setDeliveryModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('occasions.title')}</h1>
        <div className="text-sm text-gray-500">
          {t('occasions.count')}: {occasions?.length || 0}
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              placeholder={t('common.search')}
              onSearch={handleSearch}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? 'primary' : 'secondary'}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
              >
                {status === 'all' ? t('common.all') : status === 'active' ? t('common.active') : t('common.inactive')}
              </Button>
            ))}
          </div>
        </div>

        <Table loading={isLoading}>
          <Table.Head>
            <Table.Row>
              <Table.Th>{t('occasions.name')}</Table.Th>
              <Table.Th>{t('occasions.type')}</Table.Th>
              <Table.Th>{t('occasions.owner')}</Table.Th>
              <Table.Th>{t('common.status')}</Table.Th>
              <Table.Th>{t('common.date')}</Table.Th>
              <Table.Th>{t('common.actions')}</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {occasions?.map((occasion) => (
              <Table.Row key={occasion.id}>
                <Table.Td>
                  <div className="font-medium text-gray-900">
                    {occasion.occasionName}
                  </div>
                </Table.Td>
                <Table.Td>
                  <Badge color="blue">{occasion.occasionType}</Badge>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">
                    {occasion.userName || '-'}
                  </div>
                </Table.Td>
                <Table.Td>
                  <Badge color={occasion.isActive ? 'green' : 'gray'}>
                    {occasion.isActive ? t('common.active') : t('common.inactive')}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">
                    {new Date(occasion.createdAt).toLocaleDateString()}
                  </div>
                </Table.Td>
                <Table.Td>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewOccasion(occasion.id)}
                      title={t('common.view')}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeliveryDetails(occasion)}
                      title={t('delivery.add')}
                    >
                      <Truck size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(occasion.id, occasion.isActive)}
                      title={t('occasions.toggle')}
                    >
                      {occasion.isActive ? (
                        <ToggleRight size={16} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={16} className="text-gray-400" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(occasion.id)}
                      title={t('common.delete')}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Table.Td>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {occasions && occasions.length >= 20 && (
          <Pagination
            currentPage={page}
            totalPages={Math.max(page + 1, 10)}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* Delivery Details Modal */}
      {selectedOccasion && (
        <DeliveryDetailsModal
          isOpen={deliveryModalOpen}
          onClose={() => {
            setDeliveryModalOpen(false);
            setSelectedOccasion(null);
          }}
          occasionId={selectedOccasion.id}
          occasionName={selectedOccasion.name}
        />
      )}
    </div>
  );
}
