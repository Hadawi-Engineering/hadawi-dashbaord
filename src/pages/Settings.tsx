import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Smartphone, Phone, Volume2 } from 'lucide-react';
import Card from '../components/ui/Card';
import { useLanguage } from '../contexts/LanguageContext';
import adminService from '../services/adminService';

export default function Settings() {
  const { t } = useLanguage();

  // Fetch SMS balance
  const { data: smsBalance, isLoading: isLoadingSmsBalance, error: smsBalanceError } = useQuery({
    queryKey: ['sms-balance'],
    queryFn: () => adminService.getSmsBalance(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
      </div>

      {/* SMS Balance Section */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('settings.smsBalance')}</h2>
        </div>
        
        {isLoadingSmsBalance ? (
          <div className="flex items-center justify-center py-8">
            <div className="spinner" />
            <span className="ml-2 text-gray-600">{t('common.loading')}</span>
          </div>
        ) : smsBalanceError ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">{t('common.error')}</div>
            <p className="text-gray-500">{t('settings.smsBalanceError')}</p>
          </div>
        ) : smsBalance ? (
          <div className="space-y-4">
            {/* SMS Credits Balance */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('settings.smsCredits')}</h3>
                    <p className="text-sm text-gray-600">{t('settings.availableCredits')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {smsBalance.credits?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-500">{t('settings.credits')}</div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t('settings.smsInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">{t('settings.provider')}</span>
                  <p className="font-medium text-gray-900">OurSMS</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">{t('settings.lastUpdated')}</span>
                  <p className="font-medium text-gray-900">
                    {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t('settings.noSmsBalanceData')}
          </div>
        )}
      </Card>

      {/* System Information */}
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
