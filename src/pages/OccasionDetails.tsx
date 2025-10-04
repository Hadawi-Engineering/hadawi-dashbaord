import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, DollarSign, Users, TrendingUp, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import DeliveryDetailsModal from '../components/DeliveryDetailsModal';
import { useLanguage } from '../contexts/LanguageContext';

export default function OccasionDetails() {
  const { occasionId } = useParams<{ occasionId: string }>();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);

  const { data: occasionData, isLoading, error } = useQuery({
    queryKey: ['occasion-payments', occasionId],
    queryFn: () => adminService.getOccasionPayments(occasionId!),
    enabled: !!occasionId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
        <span className={`text-gray-600 ${isRTL ? 'mr-3' : 'ml-3'}`}>{t('common.loading')}</span>
      </div>
    );
  }

  if (error || !occasionData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('common.error')}</h2>
        <p className="text-gray-600 mb-6">{t('occasions.details.error')}</p>
        <Button onClick={() => navigate('/occasions')}>
          {t('occasions.details.backToOccasions')}
        </Button>
      </div>
    );
  }

  const { occasion, payments, summary } = occasionData;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: { color: 'green', text: t('payments.completed') },
      pending: { color: 'yellow', text: t('payments.pending') },
      failed: { color: 'red', text: t('payments.failed') },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'gray', text: status };
    return <Badge color={statusInfo.color as any}>{statusInfo.text}</Badge>;
  };

  const paymentColumns = [
    {
      key: 'payerName',
      label: t('payments.name'),
      render: (payment: any) => (
        <div>
          <div className="font-medium text-gray-900">{payment.payerName}</div>
          <div className="text-sm text-gray-500">{payment.personEmail}</div>
        </div>
      ),
    },
    {
      key: 'paymentAmount',
      label: t('payments.amount'),
      render: (payment: any) => (
        <div className="text-right">
          <div className="font-medium">{payment.paymentAmount.toLocaleString()} SAR</div>
          <div className="text-sm text-gray-500">{t('payments.remaining')}: {payment.remainingPrice.toLocaleString()} SAR</div>
        </div>
      ),
    },
    {
      key: 'paymentStatus',
      label: t('payments.status'),
      render: (payment: any) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(payment.paymentStatus)}
          {getStatusBadge(payment.paymentStatus)}
        </div>
      ),
    },
    {
      key: 'paymentDate',
      label: t('payments.date'),
      render: (payment: any) => new Date(payment.paymentDate).toLocaleDateString(),
    },
    {
      key: 'transactionId',
      label: t('payments.transactionId'),
      render: (payment: any) => (
        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{payment.transactionId}</code>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/occasions')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {t('occasions.details.backToOccasions')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{occasion.occasionName}</h1>
            <p className="text-gray-600">{t('occasions.details.occasionDetails')}</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => setDeliveryModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Truck size={16} />
          {t('delivery.add')}
        </Button>
      </div>

      {/* Occasion Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('occasions.type')}</p>
              <p className="font-semibold text-gray-900">{occasion.occasionType}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('occasions.details.targetAmount')}</p>
              <p className="font-semibold text-gray-900">{occasion.giftPrice.toLocaleString()} SAR</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('occasions.details.totalPaid')}</p>
              <p className="font-semibold text-gray-900">{occasion.totalPaid.toLocaleString()} SAR</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('occasions.details.remainingAmount')}</p>
              <p className="font-semibold text-gray-900">{occasion.remainingAmount.toLocaleString()} SAR</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('occasions.details.progress')}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{t('occasions.details.completion')}</span>
                <span>{summary.completionPercentage}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: summary.completionPercentage }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {occasion.isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
              <span className={`font-medium ${occasion.isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                {occasion.isCompleted ? t('occasions.details.completed') : t('occasions.details.inProgress')}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('occasions.details.summary')}</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('occasions.details.totalPayments')}</span>
              <span className="font-medium">{summary.totalPayments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('occasions.details.completedPayments')}</span>
              <span className="font-medium text-green-600">{summary.completedPayments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('occasions.details.pendingPayments')}</span>
              <span className="font-medium text-yellow-600">{summary.pendingPayments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('occasions.details.failedPayments')}</span>
              <span className="font-medium text-red-600">{summary.failedPayments}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{t('occasions.details.payments')}</h3>
          <div className="text-sm text-gray-600">
            {t('occasions.details.totalPayments')}: {payments.length}
          </div>
        </div>
        
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {paymentColumns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment, index) => (
                  <tr key={payment.id || index} className="hover:bg-gray-50">
                    {paymentColumns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                        {column.render ? column.render(payment) : payment[column.key as keyof typeof payment]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('occasions.details.noPayments')}</p>
          </div>
        )}
      </Card>

      {/* Delivery Details Modal */}
      <DeliveryDetailsModal
        isOpen={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
        occasionId={occasionId!}
        occasionName={occasion.occasionName}
      />
    </div>
  );
}
