import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Calendar, CreditCard, RefreshCw } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import StatCard from '../components/ui/StatCard';
import type { Payment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function Payments() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refundModal, setRefundModal] = useState<{isOpen: boolean, payment: Payment | null}>({
    isOpen: false,
    payment: null,
  });
  const [refundData, setRefundData] = useState({ amount: '', reason: '' });
  const queryClient = useQueryClient();

  // Fetch payments
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', page, search, statusFilter],
    queryFn: () => adminService.getPayments({ 
      page, 
      limit: 20, 
      search,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
  });

  // Fetch payment stats
  const { data: stats } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: () => adminService.getPaymentStats(),
  });

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: ({ paymentId, refundData }: { paymentId: string; refundData: any }) =>
      adminService.processRefund(paymentId, refundData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
      setRefundModal({ isOpen: false, payment: null });
      setRefundData({ amount: '', reason: '' });
    },
  });

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModal.payment) return;

    try {
      await refundMutation.mutateAsync({
        paymentId: refundModal.payment.id,
        refundData: {
          amount: Number(refundData.amount),
          reason: refundData.reason,
        },
      });
    } catch (error) {
      alert(t('common.error'));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'green' as const, label: t('payments.completed') },
      pending: { color: 'yellow' as const, label: t('payments.pending') },
      failed: { color: 'red' as const, label: t('payments.failed') },
      refunded: { color: 'gray' as const, label: t('payments.refunded') },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'gray' as const, label: status };
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('payments.title')}</h1>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={t('payments.totalRevenue')}
            value={`${stats.totalRevenue.toLocaleString()} SAR`}
            icon={DollarSign}
          />
          <StatCard
            title={t('payments.completed')}
            value={stats.completed.toLocaleString()}
            icon={TrendingUp}
          />
          <StatCard
            title={t('payments.pending')}
            value={stats.pending.toLocaleString()}
            icon={Calendar}
          />
          <StatCard
            title={t('payments.totalPayments')}
            value={stats.total.toLocaleString()}
            icon={CreditCard}
          />
        </div>
      )}

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              placeholder={t('common.search')}
              onSearch={handleSearch}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'completed', 'pending', 'failed', 'refunded'].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? 'primary' : 'secondary'}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
              >
                {status === 'all' ? t('common.all') : 
                 status === 'completed' ? t('payments.completed') :
                 status === 'pending' ? t('payments.pending') :
                 status === 'failed' ? t('payments.failed') : t('payments.refunded')}
              </Button>
            ))}
          </div>
        </div>

        <Table loading={isLoading}>
          <Table.Head>
            <Table.Row>
              <Table.Th>{t('common.name')}</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>{t('common.status')}</Table.Th>
              <Table.Th>Occasion</Table.Th>
              <Table.Th>{t('common.date')}</Table.Th>
              <Table.Th>{t('common.actions')}</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {payments?.map((payment: any) => (
              <Table.Row key={payment.id}>
                <Table.Td>
                  <div className="font-medium text-gray-900">
                    {payment.payerName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {payment.personEmail}
                  </div>
                </Table.Td>
                <Table.Td>
                  <div className="font-bold text-gray-900">
                    {payment.paymentAmount.toLocaleString()} SAR
                  </div>
                </Table.Td>
                <Table.Td>
                  {getStatusBadge(payment.paymentStatus)}
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">
                    {payment.occasionName || '-'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {payment.occasion?.occasionType}
                  </div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </div>
                </Table.Td>
                <Table.Td>
                  {payment.paymentStatus === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRefundModal({ isOpen: true, payment });
                        setRefundData({ amount: payment.paymentAmount.toString(), reason: '' });
                      }}
                    >
                      <RefreshCw size={16} />
                      {t('payments.refund')}
                    </Button>
                  )}
                </Table.Td>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {payments && payments.length >= 20 && (
          <Pagination
            currentPage={page}
            totalPages={Math.max(page + 1, 10)}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* Refund Modal */}
      {refundModal.isOpen && refundModal.payment && (
        <Modal
          isOpen={refundModal.isOpen}
          onClose={() => {
            setRefundModal({ isOpen: false, payment: null });
            setRefundData({ amount: '', reason: '' });
          }}
          title={t('payments.refund')}
        >
          <form onSubmit={handleRefund} className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">{t('common.name')}</p>
              <p className="font-medium">{(refundModal.payment as any).payerName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Original Amount</p>
              <p className="font-bold text-lg">
                {(refundModal.payment as any).paymentAmount.toLocaleString()} SAR
              </p>
            </div>

            <Input
              label={t('payments.refundAmount')}
              type="number"
              min="1"
              max={(refundModal.payment as any).paymentAmount}
              value={refundData.amount}
              onChange={(e) => setRefundData({ ...refundData, amount: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('payments.refundReason')}
              </label>
              <textarea
                value={refundData.reason}
                onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder={t('payments.refundReason')}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={refundMutation.isPending} variant="danger" className="flex-1">
                {t('payments.confirmRefund')}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setRefundModal({ isOpen: false, payment: null })}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
