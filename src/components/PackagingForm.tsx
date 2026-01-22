import React, { useState, useEffect } from 'react';
import { Save, Trash2 } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import ImageUploader from './ui/ImageUploader';
import { useLanguage } from '../contexts/LanguageContext';
import type { PackagingType, PackagingFormData } from '../types';

interface PackagingFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PackagingFormData) => void;
    initialData?: PackagingType | null;
    loading?: boolean;
}

export default function PackagingForm({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    loading
}: PackagingFormProps) {
    const { t, isRTL } = useLanguage();
    const [formData, setFormData] = useState<PackagingFormData>({
        nameAr: '',
        nameEn: '',
        descriptionAr: '',
        descriptionEn: '',
        images: [],
        amount: 0,
        giftType: 'gift',
        packagingProvider: 'hadawi',
        status: 'active',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                nameAr: initialData.nameAr || '',
                nameEn: initialData.nameEn || '',
                descriptionAr: initialData.descriptionAr || '',
                descriptionEn: initialData.descriptionEn || '',
                images: initialData.images || [],
                amount: initialData.amount || 0,
                giftType: initialData.giftType,
                packagingProvider: initialData.packagingProvider,
                status: initialData.status,
            });
        } else {
            setFormData({
                nameAr: '',
                nameEn: '',
                descriptionAr: '',
                descriptionEn: '',
                images: [],
                amount: 0,
                giftType: 'gift',
                packagingProvider: 'hadawi',
                status: 'active',
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleImageUpload = (url: string) => {
        if (url) {
            setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? t('packaging.edit') : t('packaging.add')}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* English Fields */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 border-b pb-2">English Details</h3>
                        <Input
                            label="Name (English)"
                            value={formData.nameEn}
                            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                            placeholder="e.g. Premium Box"
                            required
                        />
                        <Input
                            label="Description (English)"
                            value={formData.descriptionEn}
                            onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                            placeholder="Enter English description..."
                            multiline
                            rows={3}
                        />
                    </div>

                    {/* Arabic Fields */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 border-b pb-2">تفاصيل اللغة العربية</h3>
                        <Input
                            label="الاسم (بالعربي)"
                            value={formData.nameAr}
                            onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                            placeholder="مثال: صندوق فاخر"
                            required
                            dir="rtl"
                        />
                        <Input
                            label="الوصف (بالعربي)"
                            value={formData.descriptionAr}
                            onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                            placeholder="أدخل الوصف بالعربي..."
                            multiline
                            rows={3}
                            dir="rtl"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Input
                            label={t('packaging.amount')}
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('packaging.giftType')}
                        </label>
                        <select
                            value={formData.giftType}
                            onChange={(e) => setFormData({ ...formData, giftType: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="gift">{t('packaging.giftTypeOptions.gift')}</option>
                            <option value="money">{t('packaging.giftTypeOptions.money')}</option>
                        </select>
                    </div>
                </div>

                {/* Packaging Provider Selection */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Packaging Provider
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                            <input
                                type="radio"
                                name="packagingProvider"
                                value="hadawi"
                                checked={formData.packagingProvider === 'hadawi'}
                                onChange={(e) => setFormData({ ...formData, packagingProvider: e.target.value as 'hadawi' | 'brand' })}
                                className="w-4 h-4 mt-1 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900"> Hadawi Packaging</div>
                                <div className="text-sm text-gray-600 mt-1">Hadawi's own branded packaging</div>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                            <input
                                type="radio"
                                name="packagingProvider"
                                value="brand"
                                checked={formData.packagingProvider === 'brand'}
                                onChange={(e) => setFormData({ ...formData, packagingProvider: e.target.value as 'hadawi' | 'brand' })}
                                className="w-4 h-4 mt-1 text-purple-600 border-gray-300 focus:ring-purple-500"
                            />
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900"> Brand Packaging</div>
                                <div className="text-sm text-gray-600 mt-1">Third-party brand packaging</div>
                            </div>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('packaging.images')}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {formData.images.map((url, index) => (
                            <div key={index} className="relative group aspect-square">
                                <img
                                    src={url}
                                    alt={`Packaging ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <div className="aspect-square">
                            <ImageUploader
                                label=""
                                value=""
                                onChange={handleImageUpload}
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="secondary" onClick={onClose} type="button">
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" loading={loading} className="px-8">
                        <Save size={18} className={isRTL ? 'ml-2' : 'mr-2'} />
                        {initialData ? t('common.update') : t('common.add')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
