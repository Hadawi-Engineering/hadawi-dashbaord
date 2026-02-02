import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, DollarSign, Users, TrendingUp, CheckCircle, Clock, XCircle, Truck, Gift, ExternalLink, Package, ShoppingBag, Receipt } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DeliveryDetailsModal from '../components/DeliveryDetailsModal';
import { useLanguage } from '../contexts/LanguageContext';

export default function OccasionDetails() {
  const { occasionId } = useParams<{ occasionId: string }>();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);

  const { data: occasion, isLoading, error } = useQuery({
    queryKey: ['occasion-details', occasionId],
    queryFn: () => adminService.getOccasion(occasionId!),
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

  if (error || !occasion) {
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

  const payments = occasion.payments || [];
  const isProductBased = occasion.productBased || false;
  const totalPaid = payments
    .filter(p => p.paymentStatus === 'completed')
    .reduce((sum, p) => sum + p.paymentAmount, 0);
  const remainingAmount = (occasion.totalAmount || occasion.giftPrice) - totalPaid;
  const completionPercentage = ((totalPaid / (occasion.totalAmount || occasion.giftPrice)) * 100).toFixed(1);

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
              <p className="font-semibold text-gray-900">{(occasion.totalAmount || occasion.giftPrice).toLocaleString()} SAR</p>
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
              <p className="font-semibold text-gray-900">{totalPaid.toLocaleString()} SAR</p>
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
              <p className="font-semibold text-gray-900">{remainingAmount.toLocaleString()} SAR</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gift Details */}
      {(occasion.giftName || occasion.giftDescription || occasion.giftImages?.length || occasion.giftLink) && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Gift className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('occasions.details.giftDetails')}</h3>
          </div>

          <div className="space-y-4">
            {occasion.giftName && (
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('occasions.details.giftName')}</p>
                <p className="font-medium text-gray-900">{occasion.giftName}</p>
              </div>
            )}

            {occasion.giftDescription && (
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('occasions.details.giftDescription')}</p>
                <p className="text-gray-900">{occasion.giftDescription}</p>
              </div>
            )}

            {occasion.giftImages && occasion.giftImages.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">{t('occasions.details.giftImages')}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {occasion.giftImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${occasion.giftName || 'Gift'} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    />
                  ))}
                </div>
              </div>
            )}

            {occasion.giftLink && (
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('occasions.details.giftLink')}</p>
                <a
                  href={occasion.giftLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  {occasion.giftLink}
                  <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Products Section (Product-based occasions) */}
      {isProductBased && occasion.occasionProducts && occasion.occasionProducts.length > 0 && (
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Products</h3>
          </div>

          <div className="space-y-4">
            {occasion.occasionProducts.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                {item.product.images && item.product.images.length > 0 && (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.nameEn}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.product.nameEn}</h4>
                      {item.product.nameAr && (
                        <p className="text-sm text-gray-600">{item.product.nameAr}</p>
                      )}
                    </div>
                    <Badge color={item.product.isActive ? 'green' : 'gray'}>
                      {item.product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  {item.product.descriptionEn && (
                    <p className="text-sm text-gray-600 mb-2">{item.product.descriptionEn}</p>
                  )}
                  
                  <div className="flex gap-4 text-sm">
                    {item.product.category && (
                      <span className="text-gray-600">
                        <strong>Category:</strong> {item.product.category.nameEn}
                      </span>
                    )}
                    {item.product.brand && (
                      <span className="text-gray-600">
                        <strong>Brand:</strong> {item.product.brand.nameEn}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                    <span className="text-gray-600">Quantity: <strong className="text-gray-900">{item.quantity}</strong></span>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Price at time</p>
                      <p className="font-semibold text-gray-900">{item.priceAtTime.toLocaleString()} SAR</p>
                      <p className="text-sm text-primary-600 font-medium">
                        Total: {(item.priceAtTime * item.quantity).toLocaleString()} SAR
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Packaging Section */}
      {occasion.packaging && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Packaging</h3>
          </div>

          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            {occasion.packaging.images && occasion.packaging.images.length > 0 && (
              <img
                src={occasion.packaging.images[0]}
                alt={occasion.packaging.nameEn}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{occasion.packaging.nameEn}</h4>
                  {occasion.packaging.nameAr && (
                    <p className="text-sm text-gray-600">{occasion.packaging.nameAr}</p>
                  )}
                </div>
                <p className="font-semibold text-gray-900">{occasion.packaging.amount.toLocaleString()} SAR</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Price Breakdown (Product-based occasions) */}
      {isProductBased && (
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Receipt className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Price Breakdown</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">{(occasion.subtotal || 0).toLocaleString()} SAR</span>
            </div>
            
            {occasion.deliveryTax !== undefined && occasion.deliveryTax > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Delivery Tax</span>
                <span className="font-medium text-gray-900">{occasion.deliveryTax.toLocaleString()} SAR</span>
              </div>
            )}
            
            {occasion.serviceTax !== undefined && occasion.serviceTax > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Service Tax</span>
                <span className="font-medium text-gray-900">{occasion.serviceTax.toLocaleString()} SAR</span>
              </div>
            )}
            
            {occasion.discount !== undefined && occasion.discount > 0 && (
              <div className="flex justify-between py-2 text-green-600">
                <span>
                  Discount
                  {occasion.discountCode && ` (${occasion.discountCode})`}
                  {occasion.discountPercentage && ` - ${occasion.discountPercentage}%`}
                </span>
                <span className="font-medium">-{occasion.discount.toLocaleString()} SAR</span>
              </div>
            )}
            
            <div className="flex justify-between py-3 border-t-2 border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-lg font-bold text-primary-600">{(occasion.totalAmount || 0).toLocaleString()} SAR</span>
            </div>

            {/* Split Payment Info */}
            {occasion.splitPaymentEnabled && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Split Payment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode:</span>
                    <span className="font-medium text-gray-900">{occasion.splitPaymentMode}</span>
                  </div>
                  {occasion.numberOfPeople && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of People:</span>
                      <span className="font-medium text-gray-900">{occasion.numberOfPeople}</span>
                    </div>
                  )}
                  {occasion.amountPerPerson && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount per Person:</span>
                      <span className="font-medium text-primary-600">{occasion.amountPerPerson.toLocaleString()} SAR</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Delivery Information */}
      {occasion.deliveryAddress && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Delivery Information</h3>
          </div>

          <div className="space-y-3">
            {occasion.receiverName && (
              <div>
                <p className="text-sm text-gray-600">Receiver Name</p>
                <p className="font-medium text-gray-900">{occasion.receiverName}</p>
              </div>
            )}
            {occasion.receiverPhone && (
              <div>
                <p className="text-sm text-gray-600">Receiver Phone</p>
                <p className="font-medium text-gray-900">{occasion.receiverPhone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Delivery Address</p>
              <p className="font-medium text-gray-900">{occasion.deliveryAddress}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Progress and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('occasions.details.progress')}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{t('occasions.details.completion')}</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
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
              <span className="font-medium">{payments.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('occasions.details.completedPayments')}</span>
              <span className="font-medium text-green-600">
                {payments.filter(p => p.paymentStatus === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('occasions.details.pendingPayments')}</span>
              <span className="font-medium text-yellow-600">
                {payments.filter(p => p.paymentStatus === 'pending').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('occasions.details.failedPayments')}</span>
              <span className="font-medium text-red-600">
                {payments.filter(p => p.paymentStatus === 'failed').length}
              </span>
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
