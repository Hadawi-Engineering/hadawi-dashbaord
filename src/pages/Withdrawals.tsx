import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import type { WithdrawalRequest } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function Withdrawals() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const queryClient = useQueryClient();

  // Fetch withdrawal requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['withdrawal-requests', statusFilter],
    queryFn: () => adminService.getWithdrawalRequests({ status: statusFilter }),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (requestId: string) => {
      const admin = adminService.getCurrentAdmin();
      return adminService.approveWithdrawal(requestId, {
        approvedBy: admin?.id || '',
        processedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      setShowModal(false);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      adminService.rejectWithdrawal(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      setShowModal(false);
      setRejectReason('');
    },
  });

  const handleApprove = async (requestId: string) => {
    if (confirm(t('withdrawals.approve') + '?')) {
      try {
        await approveMutation.mutateAsync(requestId);
      } catch (error) {
        alert(t('common.error'));
      }
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      alert(t('withdrawals.enterRejectionReason'));
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        requestId: selectedRequest.id,
        reason: rejectReason,
      });
    } catch (error) {
      alert(t('common.error'));
    }
  };

  const getStatusBadge = (status: WithdrawalRequest['status']) => {
    const config = {
      pending: { color: 'yellow' as const, label: t('withdrawals.pending') },
      approved: { color: 'green' as const, label: t('withdrawals.approved') },
      rejected: { color: 'red' as const, label: t('withdrawals.rejected') },
    };
    return <Badge color={config[status].color}>{config[status].label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('withdrawals.title')}</h1>
        <div className="text-sm text-gray-500">
          {t('common.total')}: {requests?.length || 0}
        </div>
      </div>

      <Card>
        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'pending' ? t('withdrawals.pending') :
               status === 'approved' ? t('withdrawals.approved') : t('withdrawals.rejected')}
            </Button>
          ))}
        </div>

        <Table loading={isLoading}>
          <Table.Head>
            <Table.Row>
              <Table.Th>{t('common.name')}</Table.Th>
              <Table.Th>{t('common.phone')}</Table.Th>
              <Table.Th>{t('withdrawals.accountNumber')}</Table.Th>
              <Table.Th>{t('withdrawals.iban')}</Table.Th>
              <Table.Th>{t('withdrawals.amount')}</Table.Th>
              <Table.Th>{t('common.date')}</Table.Th>
              <Table.Th>{t('common.status')}</Table.Th>
              <Table.Th>{t('common.actions')}</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {requests?.map((request) => (
              <Table.Row key={request.id}>
                <Table.Td>
                  <div className="font-medium text-gray-900">{request.userName}</div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600" dir="ltr">{request.phone}</div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600 font-mono">{request.accountNumber}</div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600 font-mono text-xs">{request.iban}</div>
                </Table.Td>
                <Table.Td>
                  <div className="font-bold text-gray-900">
                    {request.amount.toLocaleString()} SAR
                  </div>
                </Table.Td>
                <Table.Td>
                  <div className="text-gray-600">
                    {new Date(request.date).toLocaleDateString()}
                  </div>
                </Table.Td>
                <Table.Td>
                  {getStatusBadge(request.status)}
                </Table.Td>
                <Table.Td>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowModal(true);
                      }}
                    >
                      <Eye size={16} />
                    </Button>
                    {request.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowModal(true);
                          }}
                        >
                          <XCircle size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </Table.Td>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedRequest(null);
            setRejectReason('');
          }}
          title={t('withdrawals.title')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('common.name')}</p>
                <p className="font-medium text-gray-900">{selectedRequest.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('common.phone')}</p>
                <p className="font-medium text-gray-900" dir="ltr">{selectedRequest.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">{t('withdrawals.accountNumber')}</p>
                <p className="font-medium text-gray-900 font-mono">{selectedRequest.accountNumber}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">{t('withdrawals.iban')}</p>
                <p className="font-medium text-gray-900 font-mono text-sm">{selectedRequest.iban}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('withdrawals.bank')}</p>
                <p className="font-medium text-gray-900">{selectedRequest.paymentAccount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('withdrawals.amount')}</p>
                <p className="font-bold text-lg text-gray-900">
                  {selectedRequest.amount.toLocaleString()} SAR
                </p>
              </div>
              {selectedRequest.paymentDescription && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">{t('withdrawals.description')}</p>
                  <p className="font-medium text-gray-900">{selectedRequest.paymentDescription}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">{t('common.date')}</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedRequest.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('common.status')}</p>
                {getStatusBadge(selectedRequest.status)}
              </div>
              {selectedRequest.processedAt && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">{t('withdrawals.processedDate')}</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedRequest.processedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {selectedRequest.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">{t('withdrawals.rejectionReason')}</p>
                  <p className="font-medium text-red-600">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="pt-4 border-t space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('withdrawals.rejectionReasonOptional')}
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder={t('withdrawals.rejectionReasonPlaceholder')}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="success"
                    onClick={() => handleApprove(selectedRequest.id)}
                    loading={approveMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle size={20} />
                    {t('withdrawals.approve')}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleReject}
                    loading={rejectMutation.isPending}
                    className="flex-1"
                  >
                    <XCircle size={20} />
                    {t('withdrawals.reject')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
