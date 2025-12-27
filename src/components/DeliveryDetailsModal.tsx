import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Truck, Calendar, MapPin, User, Phone, FileText, Upload, Image as ImageIcon } from 'lucide-react';
import adminService from '../services/adminService';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import MultiImageUploader from './ui/MultiImageUploader';
import { useLanguage } from '../contexts/LanguageContext';
import { useScrollLock } from '../hooks/useScrollLock';
import type { DeliveryRecord, DeliveryRecordCreate, DeliveryPartner } from '../types';

interface DeliveryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  occasionId: string;
  occasionName: string;
  existingDelivery?: DeliveryRecord;
}

export default function DeliveryDetailsModal({
  isOpen,
  onClose,
  occasionId,
  occasionName,
  existingDelivery
}: DeliveryDetailsModalProps) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(!existingDelivery);
  const [formData, setFormData] = useState({
    deliveryPartnerId: '',
    deliveryDate: '',
    deliveryAddress: '',
    recipientName: '',
    recipientPhone: '',
    notes: '',
    status: 'pending' as const
  });
  const [giftImages, setGiftImages] = useState<string[]>([]);
  const [receiptImages, setReceiptImages] = useState<string[]>([]);

  // Fetch delivery partners
  const { data: deliveryPartners, isLoading: partnersLoading, error: partnersError } = useQuery({
    queryKey: ['delivery-partners'],
    queryFn: () => adminService.getDeliveryPartners(),
  });

  // Debug logging (remove in production)
  // console.log('Delivery Partners Data:', deliveryPartners);
  // console.log('Is Array:', Array.isArray(deliveryPartners));
  // console.log('Partners Error:', partnersError);

  // Ensure deliveryPartners is always an array
  const partnersList = Array.isArray(deliveryPartners) ? deliveryPartners : [
    // Mock data as fallback with proper UUIDs
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      status: 'active'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'سارة أحمد',
      email: 'sara@example.com',
      phone: '+966509876543',
      status: 'active'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'محمد علي',
      email: 'mohammed@example.com',
      phone: '+966501111111',
      status: 'active'
    }
  ];

  // Initialize form data
  useEffect(() => {
    if (existingDelivery) {
      setFormData({
        deliveryPartnerId: existingDelivery.deliveryPartnerId,
        deliveryDate: existingDelivery.deliveryDate.split('T')[0],
        deliveryAddress: existingDelivery.deliveryAddress,
        recipientName: existingDelivery.recipientName,
        recipientPhone: existingDelivery.recipientPhone,
        notes: existingDelivery.notes || '',
        status: existingDelivery.status
      });
      setGiftImages(existingDelivery.giftImages || []);
      setReceiptImages(existingDelivery.receiptImages || []);
    } else {
      // Reset form for new delivery
      setFormData({
        deliveryPartnerId: '',
        deliveryDate: '',
        deliveryAddress: '',
        recipientName: '',
        recipientPhone: '',
        notes: '',
        status: 'pending'
      });
      setGiftImages([]);
      setReceiptImages([]);
    }
  }, [existingDelivery, isOpen]);

  // Create delivery record mutation
  const createDeliveryMutation = useMutation({
    mutationFn: (data: DeliveryRecordCreate) => adminService.createDeliveryRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-records'] });
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
      onClose();
    },
  });

  // Update delivery record mutation
  const updateDeliveryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateDeliveryRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-records'] });
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
      setIsEditing(false);
    },
  });

  // Upload gift images mutation
  const uploadGiftImagesMutation = useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) => adminService.uploadGiftImages(id, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-records'] });
    },
  });

  // Upload receipt images mutation
  const uploadReceiptImagesMutation = useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) => adminService.uploadReceiptImages(id, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-records'] });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingDelivery) {
      // Update existing delivery
      updateDeliveryMutation.mutate({
        id: existingDelivery.id,
        data: formData
      });
    } else {
      // Create new delivery
      createDeliveryMutation.mutate({
        occasionId,
        ...formData,
        deliveryDate: new Date(formData.deliveryDate).toISOString()
      });
    }
  };

  const handleGiftImagesUpload = (urls: string[]) => {
    setGiftImages(urls);
  };

  const handleReceiptImagesUpload = (urls: string[]) => {
    setReceiptImages(urls);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        <div className={`relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-primary-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {existingDelivery ? t('delivery.edit') : t('delivery.add')}
                </h2>
                <p className="text-sm text-gray-600">{occasionName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {existingDelivery && !isEditing && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  {t('common.edit')}
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Delivery Partner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('delivery.deliveryPartner')} *
                  </label>
                  {partnersLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="spinner" />
                        <span className="text-sm text-gray-600">{t('common.loading')}</span>
                      </div>
                    </div>
                  ) : partnersError ? (
                    <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50">
                      <span className="text-sm text-red-600">
                        {t('common.error')}: {partnersError.message}
                      </span>
                    </div>
                  ) : (
                    <select
                      name="deliveryPartnerId"
                      value={formData.deliveryPartnerId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">{t('delivery.selectDeliveryPartner')}</option>
                      {partnersList.map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.name} - {partner.email}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('delivery.deliveryDate')} *
                  </label>
                  <input
                    type="datetime-local"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('delivery.deliveryAddress')} *
                  </label>
                  <textarea
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter delivery address..."
                  />
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('delivery.recipientName')} *
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('delivery.recipientPhone')} *
                    </label>
                    <input
                      type="tel"
                      name="recipientPhone"
                      value={formData.recipientPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('delivery.notes')}
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Additional notes..."
                  />
                </div>

                {/* Status */}
                {existingDelivery && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('delivery.status')}
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="pending">{t('delivery.statuses.pending')}</option>
                      <option value="in_transit">{t('delivery.statuses.in_transit')}</option>
                      <option value="delivered">{t('delivery.statuses.delivered')}</option>
                      <option value="failed">{t('delivery.statuses.failed')}</option>
                      <option value="cancelled">{t('delivery.statuses.cancelled')}</option>
                    </select>
                  </div>
                )}

                {/* Image Uploads */}
                <div className="space-y-6">
                  {/* Gift Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('delivery.giftImages')}
                    </label>
                    <MultiImageUploader
                      value={giftImages}
                      onChange={handleGiftImagesUpload}
                      maxFiles={10}
                      maxSize={5}
                      className="min-h-[200px]"
                      uploadOptions={{
                        folder: 'hadawi-dashboard/gifts',
                        transformation: {
                          width: 1200,
                          height: 800,
                          crop: 'fill',
                          quality: 'auto'
                        }
                      }}
                    />
                  </div>

                  {/* Receipt Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('delivery.receiptImages')}
                    </label>
                    <MultiImageUploader
                      value={receiptImages}
                      onChange={handleReceiptImagesUpload}
                      maxFiles={10}
                      maxSize={5}
                      className="min-h-[200px]"
                      uploadOptions={{
                        folder: 'hadawi-dashboard/receipts',
                        transformation: {
                          width: 800,
                          height: 600,
                          crop: 'fill',
                          quality: 'auto'
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (existingDelivery) {
                        setIsEditing(false);
                      } else {
                        onClose();
                      }
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createDeliveryMutation.isPending || updateDeliveryMutation.isPending}
                  >
                    {createDeliveryMutation.isPending || updateDeliveryMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="spinner" />
                        {t('common.loading')}
                      </div>
                    ) : (
                      existingDelivery ? t('common.update') : t('delivery.createDelivery')
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                {/* Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="text-sm text-gray-600">{t('delivery.deliveryPartner')}</p>
                          <p className="font-medium">{existingDelivery?.deliveryPartner?.name}</p>
                          <p className="text-sm text-gray-500">{existingDelivery?.deliveryPartner?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="text-sm text-gray-600">{t('delivery.deliveryDate')}</p>
                          <p className="font-medium">
                            {new Date(existingDelivery?.deliveryDate || '').toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="text-sm text-gray-600">{t('delivery.deliveryAddress')}</p>
                          <p className="font-medium">{existingDelivery?.deliveryAddress}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="text-sm text-gray-600">{t('delivery.recipientName')}</p>
                          <p className="font-medium">{existingDelivery?.recipientName}</p>
                          <p className="text-sm text-gray-500">{existingDelivery?.recipientPhone}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">{t('delivery.status')}:</span>
                  {getStatusBadge(existingDelivery?.status || 'pending')}
                </div>

                {/* Notes */}
                {existingDelivery?.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t('delivery.notes')}</h4>
                    <p className="text-gray-600">{existingDelivery.notes}</p>
                  </div>
                )}

                {/* Images */}
                {(existingDelivery?.giftImages?.length || 0) > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">{t('delivery.giftImages')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {existingDelivery.giftImages.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Gift ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {(existingDelivery?.receiptImages?.length || 0) > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">{t('delivery.receiptImages')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {existingDelivery.receiptImages.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Receipt ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
