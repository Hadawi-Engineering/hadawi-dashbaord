import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { useLanguage } from '../contexts/LanguageContext';
import type { OccasionType, OccasionTypeFormData } from '../types';

interface OccasionTypeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: OccasionTypeFormData) => void;
    initialData?: OccasionType | null;
    loading?: boolean;
}

export default function OccasionTypeForm({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    loading
}: OccasionTypeFormProps) {
    const { t, isRTL } = useLanguage();
    const [formData, setFormData] = useState<OccasionTypeFormData>({
        key: '',
        nameAr: '',
        nameEn: '',
        isActive: true,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                key: initialData.key || '',
                nameAr: initialData.nameAr || '',
                nameEn: initialData.nameEn || '',
                isActive: initialData.isActive ?? true,
            });
        } else {
            setFormData({
                key: '',
                nameAr: '',
                nameEn: '',
                isActive: true,
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? t('occasionTypes.edit') : t('occasionTypes.add')}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    <Input
                        label={t('occasionTypes.key')}
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                        placeholder="e.g. birthday"
                        required
                        disabled={!!initialData}
                        helperText={initialData ? "The key cannot be changed once created." : "Unique identifier for this occasion type."}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* English Fields */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 border-b pb-2">English Details</h3>
                        <Input
                            label="Name (English)"
                            value={formData.nameEn}
                            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                            placeholder="e.g. Birthday"
                            required
                        />
                    </div>

                    {/* Arabic Fields */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 border-b pb-2">تفاصيل اللغة العربية</h3>
                        <Input
                            label="الاسم (بالعربي)"
                            value={formData.nameAr}
                            onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                            placeholder="مثال: عيد ميلاد"
                            required
                            dir="rtl"
                        />
                    </div>
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
