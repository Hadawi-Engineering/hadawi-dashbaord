import React from 'react';
import Card from '../components/ui/Card';
import { useLanguage } from '../contexts/LanguageContext';

export default function Settings() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
      </div>


      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('settings.systemInfo')}</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b">
            <span className="text-gray-600">{t('settings.version')}</span>
            <span className="font-medium text-gray-900">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <span className="text-gray-600">{t('dashboard.lastUpdate')}</span>
            <span className="font-medium text-gray-900">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600">{t('settings.environment')}</span>
            <span className="font-medium text-gray-900">
              {import.meta.env.MODE === 'production' ? t('settings.production') : t('settings.development')}
            </span>
          </div>
        </div>
      </Card>

      <Card>
       
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-500">
            © 2025 Hadawi. {t('login.copyright')}
          </p>
        </div>
      </Card>
    </div>
  );
}
