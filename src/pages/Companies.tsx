import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Globe, ExternalLink } from 'lucide-react';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ImageUpload from '../components/ui/ImageUpload';
import type { Company } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function Companies() {
    const { t } = useLanguage();
    const [showModal, setShowModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        websiteUrl: '',
        logoUrl: '',
        isActive: true,
    });
    const queryClient = useQueryClient();

    // Fetch companies
    const { data: companies, isLoading } = useQuery({
        queryKey: ['companies'],
        queryFn: () => adminService.getCompanies(),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: any) => adminService.createCompany(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            handleCloseModal();
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            adminService.updateCompany(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            handleCloseModal();
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
    });

    const handleOpenModal = (company?: Company) => {
        if (company) {
            setEditingCompany(company);
            setFormData({
                name: company.name,
                description: company.description || '',
                websiteUrl: company.websiteUrl || '',
                logoUrl: company.logoUrl || '',
                isActive: company.isActive,
            });
        } else {
            setEditingCompany(null);
            setFormData({
                name: '',
                description: '',
                websiteUrl: '',
                logoUrl: '',
                isActive: true,
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCompany(null);
        setFormData({
            name: '',
            description: '',
            websiteUrl: '',
            logoUrl: '',
            isActive: true,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            name: formData.name,
            description: formData.description,
            websiteUrl: formData.websiteUrl,
            logoUrl: formData.logoUrl,
            isActive: formData.isActive,
        };

        try {
            if (editingCompany) {
                await updateMutation.mutateAsync({ id: editingCompany.id, data });
            } else {
                await createMutation.mutateAsync(data);
            }
        } catch (error) {
            alert(t('common.error'));
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('companies.deleteConfirm'))) {
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
                <h1 className="text-3xl font-bold text-gray-900">{t('companies.title')}</h1>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    {t('companies.add')}
                </Button>
            </div>

            <Card>
                <Table loading={isLoading}>
                    <Table.Head>
                        <Table.Row>
                            <Table.Th>{t('companies.name')}</Table.Th>
                            <Table.Th>{t('companies.website')}</Table.Th>
                            <Table.Th>{t('common.status')}</Table.Th>
                            <Table.Th>{t('common.actions')}</Table.Th>
                        </Table.Row>
                    </Table.Head>
                    <Table.Body>
                        {companies?.map((company) => (
                            <Table.Row key={company.id}>
                                <Table.Td>
                                    <div className="flex items-center gap-3">
                                        {company.logoUrl ? (
                                            <img
                                                src={company.logoUrl}
                                                alt={company.name}
                                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                                {company.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-900">{company.name}</div>
                                            {company.description && (
                                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                                    {company.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Table.Td>
                                <Table.Td>
                                    {company.websiteUrl ? (
                                        <a
                                            href={company.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                                        >
                                            <Globe size={16} />
                                            <span className="text-sm">Visit</span>
                                            <ExternalLink size={12} />
                                        </a>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    <Badge color={company.isActive ? 'green' : 'red'}>
                                        {company.isActive ? t('common.active') : t('common.inactive')}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleOpenModal(company)}
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => handleDelete(company.id)}
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
                    title={editingCompany ? t('companies.edit') : t('companies.add')}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label={t('companies.name')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Company Name"
                            required
                        />

                        <Input
                            label={t('companies.description')}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the company"
                        />

                        <Input
                            label={t('companies.website')}
                            value={formData.websiteUrl}
                            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                            placeholder="https://example.com"
                            type="url"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('companies.logo')}
                            </label>
                            <ImageUpload
                                images={formData.logoUrl ? [formData.logoUrl] : []}
                                onChange={(images) => setFormData({ ...formData, logoUrl: images[0] || '' })}
                                multiple={false}
                                maxImages={1}
                                folder="companies"
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
                                {editingCompany ? t('common.update') : t('common.add')}
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
