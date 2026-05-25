import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import adminService from '../services/adminService';
import type { NotificationTemplate, User } from '../types';
import { ToastProvider } from '../components/ui/Toast';
import NotificationSendTab from '../components/notifications/NotificationSendTab';
import NotificationScheduledTab from '../components/notifications/NotificationScheduledTab';
import NotificationTemplatesTab from '../components/notifications/NotificationTemplatesTab';
import NotificationHistoryTab from '../components/notifications/NotificationHistoryTab';

type NotificationTab = 'send' | 'scheduled' | 'templates' | 'history';

function NotificationsContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<NotificationTab>('send');
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSharedData = useCallback(async () => {
    setLoading(true);
    try {
      const [templatesData, usersData] = await Promise.all([
        adminService.getNotificationTemplates(),
        adminService.getUsers(),
      ]);
      setTemplates(templatesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading notification data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSharedData();
  }, [loadSharedData]);

  const tabs: { key: NotificationTab; label: string }[] = [
    { key: 'send', label: t('notifications.send') },
    { key: 'scheduled', label: t('notifications.scheduled') },
    { key: 'templates', label: t('notifications.templates') },
    { key: 'history', label: t('notifications.history') },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{t('notifications.pageTitle')}</h1>
        <p className="text-gray-600">{t('notifications.notificationManagementDescription')}</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex flex-wrap gap-x-8 gap-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading && activeTab !== 'scheduled' ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <>
          {activeTab === 'send' && (
            <NotificationSendTab
              users={users}
              onScheduled={() => setActiveTab('scheduled')}
            />
          )}
          {activeTab === 'scheduled' && <NotificationScheduledTab />}
          {activeTab === 'templates' && (
            <NotificationTemplatesTab templates={templates} onRefresh={loadSharedData} />
          )}
          {activeTab === 'history' && <NotificationHistoryTab />}
        </>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ToastProvider>
      <NotificationsContent />
    </ToastProvider>
  );
}
