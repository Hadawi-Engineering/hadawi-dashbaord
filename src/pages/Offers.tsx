import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ImageUpload from '../components/ui/ImageUpload';
import type { Offer } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function Offers() {
    const { t } = useLanguage();
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount: '',
        companyId: '',
        imageUrl: '',
        promoCode: '',
        validFrom: '',
        validUntil: '',
        isActive: true,
    });
    const queryClient = useQueryClient();

    // Fetch offers
    const { data: offers, isLoading: offersLoading } = useQuery({
        queryKey: ['offers'],
        queryFn: () => adminService.getOffers(),
    });

    // Fetch companies for dropdown
    const { data: companies, isLoading: companiesLoading } = useQuery({
        queryKey: ['companies'],
        queryFn: () => adminService.getCompanies(),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: any) => adminService.createOffer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            handleCloseModal();
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            adminService.updateOffer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            handleCloseModal();
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteOffer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
        },
    });

    const handleOpenModal = (offer?: Offer) => {
        if (offer) {
            setEditingOffer(offer);
            setFormData({
                title: offer.title,
                description: offer.description || '',
                discount: offer.discount,
                companyId: offer.companyId,
                imageUrl: offer.imageUrl || '',
                promoCode: offer.promoCode || '',
                validFrom: offer.validFrom ? offer.validFrom.split('T')[0] : '',
                validUntil: offer.validUntil ? offer.validUntil.split('T')[0] : '',
                isActive: offer.isActive,
            });
        } else {
            setEditingOffer(null);
            setFormData({
                title: '',
                description: '',
                discount: '',
                companyId: '',
                imageUrl: '',
                promoCode: '',
                validFrom: '',
                validUntil: '',
                isActive: true,
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingOffer(null);
        setFormData({
            title: '',
            description: '',
            discount: '',
            companyId: '',
            imageUrl: '',
            promoCode: '',
            validFrom: '',
            validUntil: '',
            isActive: true,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            title: formData.title,
            description: formData.description,
            discount: formData.discount,
            companyId: formData.companyId,
            imageUrl: formData.imageUrl,
            promoCode: formData.promoCode,
            validFrom: formData.validFrom || null,
            validUntil: formData.validUntil || null,
            isActive: formData.isActive,
        };

        try {
            if (editingOffer) {
                await updateMutation.mutateAsync({ id: editingOffer.id, data });
            } else {
                await createMutation.mutateAsync(data);
            }
        } catch (error) {
            alert(t('common.error'));
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('offers.deleteConfirm'))) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                alert(t('common.error'));
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">{t('offers.title')}</h1>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    {t('offers.add')}
                </Button>
            </div>

            <Card>
                <Table loading={offersLoading}>
                    <Table.Head>
                        <Table.Row>
                            <Table.Th>{t('offers.offerTitle')}</Table.Th>
                            <Table.Th>{t('offers.company')}</Table.Th>
                            <Table.Th>{t('offers.discount')}</Table.Th>
                            <Table.Th>{t('common.status')}</Table.Th>
                            <Table.Th>{t('common.actions')}</Table.Th>
                        </Table.Row>
                    </Table.Head>
                    <Table.Body>
                        {offers?.map((offer) => (
                            <Table.Row key={offer.id}>
                                <Table.Td>
                                    <div className="flex items-center gap-3">
                                        {offer.imageUrl ? (
                                            <img
                                                src={offer.imageUrl}
                                                alt={offer.title}
                                                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                                                <Tag size={20} />
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-900">{offer.title}</div>
                                            {offer.promoCode && (
                                                <div className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-1">
                                                    {offer.promoCode}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Table.Td>
                                <Table.Td>
                                    <div className="flex items-center gap-2">
                                        {offer.company?.logoUrl && (
                                            <img
                                                src={offer.company.logoUrl}
                                                alt={offer.company.name}
                                                className="w-6 h-6 rounded-full object-cover"
                                            />
                                        )}
                                        <span className="text-sm text-gray-700">
                                            {offer.company?.name || 'Unknown Company'}
                                        </span>
                                    </div>
                                </Table.Td>
                                <Table.Td>
                                    <span className="font-bold text-green-600">{offer.discount}</span>
                                </Table.Td>
                                <Table.Td>
                                    <Badge color={offer.isActive ? 'green' : 'red'}>
                                        {offer.isActive ? t('common.active') : t('common.inactive')}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleOpenModal(offer)}
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => handleDelete(offer.id)}
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
                    title={editingOffer ? t('offers.edit') : t('offers.add')}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label={t('offers.offerTitle')}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Summer Sale"
                            required
                        />

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                                {t('offers.company')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.companyId}
                                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                required
                                disabled={companiesLoading}
                            >
                                <option value="">Select a company</option>
                                {companies?.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label={t('offers.discount')}
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            placeholder="50% OFF"
                            required
                        />

                        <Input
                            label={t('offers.description')}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Details about the offer"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('offers.image')}
                            </label>
                            <ImageUpload
                                images={formData.imageUrl ? [formData.imageUrl] : []}
                                onChange={(images) => setFormData({ ...formData, imageUrl: images[0] || '' })}
                                multiple={false}
                                maxImages={1}
                                folder="offers"
                            />
                        </div>

                        <Input
                            label={t('offers.promoCode')}
                            value={formData.promoCode}
                            onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                            placeholder="SAVE50"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label={t('offers.validFrom')}
                                type="date"
                                value={formData.validFrom}
                                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                            />
                            <Input
                                label={t('offers.validUntil')}
                                type="date"
                                value={formData.validUntil}
                                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
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
                                {editingOffer ? t('common.update') : t('common.add')}
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
