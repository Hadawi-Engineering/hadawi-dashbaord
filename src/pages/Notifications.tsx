import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import adminService from '../services/adminService';
import { ClipboardList, CheckCircle, Star, Bell } from 'lucide-react';
import type {
  NotificationTemplate,
  NotificationStats,
  NotificationHistory,
  NotificationTrigger,
  NotificationTemplateCreate,
  NotificationSend,
  User
} from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { StatCard } from '../components/ui/StatCard';

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'templates' | 'send' | 'analytics' | 'history'>('templates');
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<NotificationTrigger | ''>('');

  // Template Management States
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<NotificationTemplateCreate>({
    name: '',
    description: '',
    trigger: 'payment_received',
    title: '',
    body: '',
    imageUrl: '',
    data: {},
    isDefault: false,
    status: 'active'
  });

  // Send Notification States
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendToAllUsers, setSendToAllUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sendForm, setSendForm] = useState<NotificationSend>({
    userIds: [],
    title: '',
    body: '',
    imageUrl: '',
    data: {},
    scheduledAt: ''
  });

  // Trigger Notification States
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [selectedTriggerForSend, setSelectedTriggerForSend] = useState<NotificationTrigger>('payment_received');
  const [triggerVariables, setTriggerVariables] = useState<Record<string, string>>({});

  // Inactive User Reminders State
  const [daysInactive, setDaysInactive] = useState(30);
  const [sendingReminders, setSendingReminders] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedTrigger]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesData, statsData, historyData, usersData] = await Promise.all([
        adminService.getNotificationTemplates({ trigger: selectedTrigger || undefined }),
        adminService.getNotificationStats(),
        adminService.getNotificationHistory(),
        adminService.getUsers()
      ]);

      setTemplates(templatesData);
      setStats(statsData);
      setHistory(Array.isArray(historyData) ? historyData : []);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      await adminService.createNotificationTemplate(templateForm);
      setShowTemplateModal(false);
      resetTemplateForm();
      loadData();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      await adminService.updateNotificationTemplate(editingTemplate.id, templateForm);
      setShowTemplateModal(false);
      setEditingTemplate(null);
      resetTemplateForm();
      loadData();
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleSetAsDefault = async (templateId: string) => {
    try {
      await adminService.setTemplateAsDefault(templateId);
      loadData();
    } catch (error) {
      console.error('Error setting template as default:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await adminService.deleteNotificationTemplate(templateId);
      loadData();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!sendToAllUsers && selectedUsers.length === 0) {
      return;
    }
    try {
      const userIds = sendToAllUsers ? ['all'] : selectedUsers;
      await adminService.sendNotification({
        userIds,
        title: sendForm.title,
        body: sendForm.body,
        imageUrl: sendForm.imageUrl,
        data: sendForm.data
      });
      setShowSendModal(false);
      resetSendForm();
      loadData();
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const canSendNotification = sendToAllUsers || selectedUsers.length > 0;

  const handleTriggerNotification = async () => {
    try {
      await adminService.triggerEventNotification(selectedTriggerForSend, {
        userIds: selectedUsers,
        variables: triggerVariables
      });
      setShowTriggerModal(false);
      resetTriggerForm();
      loadData();
    } catch (error) {
      console.error('Error triggering notification:', error);
    }
  };

  const handleSendInactiveReminders = async () => {
    if (!confirm(t('notifications.confirmSendReminders'))) return;

    setSendingReminders(true);
    try {
      const admin = adminService.getCurrentAdmin();
      if (!admin) {
        alert(t('common.error'));
        return;
      }
      const result = await adminService.sendInactiveUserReminder(daysInactive, admin.id);
      alert(t('notifications.remindersSentSuccess').replace('{{count}}', result.count.toString()));
    } catch (error) {
      console.error('Error sending inactive reminders:', error);
      alert(t('common.error'));
    } finally {
      setSendingReminders(false);
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      trigger: 'payment_received',
      title: '',
      body: '',
      imageUrl: '',
      data: {},
      isDefault: false,
      status: 'active'
    });
  };

  const resetSendForm = () => {
    setSendForm({
      userIds: [],
      title: '',
      body: '',
      imageUrl: '',
      data: {},
      scheduledAt: ''
    });
    setSendToAllUsers(false);
    setSelectedUsers([]);
  };

  const resetTriggerForm = () => {
    setTriggerVariables({});
    setSelectedUsers([]);
  };

  const openEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description,
      trigger: template.trigger,
      title: template.title,
      body: template.body,
      imageUrl: template.imageUrl || '',
      data: template.data || {},
      isDefault: template.isDefault,
      status: template.status
    });
    setShowTemplateModal(true);
  };

  const getTriggerVariables = (trigger: NotificationTrigger) => {
    const variables = {
      payment_received: ['occasionName', 'amount', 'payerName', 'occasionId', 'occasionType'],
      occasion_completed: ['occasionName', 'totalAmount', 'occasionId', 'completionDate'],
      occasion_created: ['occasionName', 'occasionType', 'occasionId', 'creatorName'],
      payment_reminder: ['occasionName', 'remainingAmount', 'occasionId', 'daysLeft']
    };
    return variables[trigger] || [];
  };

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('notifications.notificationTemplates')}</h2>
        <div className="flex gap-2">
          <select
            value={selectedTrigger}
            onChange={(e) => setSelectedTrigger(e.target.value as NotificationTrigger | '')}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">{t('notifications.allTriggers')}</option>
            <option value="payment_received">{t('notifications.paymentReceived')}</option>
            <option value="occasion_completed">{t('notifications.occasionCompleted')}</option>
            <option value="occasion_created">{t('notifications.occasionCreated')}</option>
            <option value="payment_reminder">{t('notifications.paymentReminder')}</option>
          </select>
          <Button onClick={() => setShowTemplateModal(true)}>
            {t('notifications.createTemplate')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{template.name}</h3>
              <div className="flex gap-1">
                {template.isDefault && (
                  <Badge variant="success">{t('notifications.default')}</Badge>
                )}
                <Badge variant={template.status === 'active' ? 'success' : 'secondary'}>
                  {template.status}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
            <div className="text-sm">
              <p><strong>{t('notifications.trigger')}:</strong> {template.trigger}</p>
              <p><strong>{t('notifications.title')}:</strong> {template.title}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEditTemplate(template)}
              >
                {t('notifications.edit')}
              </Button>
              {!template.isDefault && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSetAsDefault(template.id)}
                >
                  {t('notifications.setDefault')}
                </Button>
              )}
              {!template.isDefault && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  {t('notifications.delete')}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSendTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('notifications.sendNotifications')}</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowSendModal(true)}>
            {t('notifications.sendCustomNotification')}
          </Button>
          <Button onClick={() => setShowTriggerModal(true)} variant="outline">
            {t('notifications.triggerEventNotification')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('notifications.customNotification')}</h3>
          <p className="text-gray-600 mb-4">{t('notifications.customNotificationDescription')}</p>
          <Button onClick={() => setShowSendModal(true)}>
            {t('notifications.createCustomNotification')}
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('notifications.triggerNotification')}</h3>
          <p className="text-gray-600 mb-4">{t('notifications.triggerNotificationDescription')}</p>
          <Button onClick={() => setShowTriggerModal(true)} variant="outline">
            {t('notifications.triggerEvent')}
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('notifications.inactiveReminders')}</h3>
          <p className="text-gray-600 mb-4">{t('notifications.inactiveRemindersDescription')}</p>
          <div className="flex items-end gap-4">
            <Input
              label={t('notifications.daysInactive')}
              type="number"
              value={daysInactive}
              onChange={(e) => setDaysInactive(parseInt(e.target.value) || 0)}
              min={1}
            />
            <Button
              onClick={handleSendInactiveReminders}
              loading={sendingReminders}
              className="mb-1"
            >
              {t('notifications.sendReminders')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('notifications.notificationAnalytics')}</h2>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('notifications.totalTemplates')}
            value={stats.totalTemplates}
            icon={ClipboardList}
          />
          <StatCard
            title={t('notifications.activeTemplates')}
            value={stats.activeTemplates}
            icon={CheckCircle}
          />
          <StatCard
            title={t('notifications.defaultTemplates')}
            value={stats.defaultTemplates}
            icon={Star}
          />
          <StatCard
            title={t('notifications.totalTriggers')}
            value={Object.values(stats.triggers).reduce((sum, count) => sum + count, 0)}
            icon={Bell}
          />
        </div>
      )}

      {stats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('notifications.templatesByTrigger')}</h3>
          <div className="space-y-2">
            {Object.entries(stats.triggers).map(([trigger, count]) => (
              <div key={trigger} className="flex justify-between items-center">
                <span className="capitalize">{trigger.replace('_', ' ')}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('notifications.notificationHistory')}</h2>

      <Card>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Th>{t('notifications.title')}</Table.Th>
              <Table.Th>{t('notifications.body')}</Table.Th>
              <Table.Th>{t('notifications.status')}</Table.Th>
              <Table.Th>{t('notifications.sentAt')}</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {history.map((item) => (
              <Table.Row key={item.id}>
                <Table.Td>{item.title}</Table.Td>
                <Table.Td>{item.body}</Table.Td>
                <Table.Td>
                  <Badge variant={item.status === 'sent' ? 'success' : 'secondary'}>
                    {item.status}
                  </Badge>
                </Table.Td>
                <Table.Td>{new Date(item.sentAt).toLocaleString()}</Table.Td>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('notifications.pageTitle')}</h1>
        <p className="text-gray-600">{t('notifications.notificationManagementDescription')}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'templates', label: t('notifications.templates') },
            { key: 'send', label: t('notifications.send') },
            { key: 'analytics', label: t('notifications.analytics') },
            { key: 'history', label: t('notifications.history') }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {activeTab === 'templates' && renderTemplatesTab()}
          {activeTab === 'send' && renderSendTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
          {activeTab === 'history' && renderHistoryTab()}
        </>
      )}

      {/* Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplate(null);
          resetTemplateForm();
        }}
        title={editingTemplate ? t('notifications.editTemplate') : t('notifications.createTemplate')}
      >
        <div className="space-y-4">
          <Input
            label={t('notifications.templateName')}
            value={templateForm.name}
            onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
            placeholder={t('notifications.enterTemplateName')}
          />

          <Input
            label={t('notifications.description')}
            value={templateForm.description}
            onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
            placeholder={t('notifications.enterDescription')}
          />

          <div>
            <label className="block text-sm font-medium mb-2">{t('notifications.trigger')}</label>
            <select
              value={templateForm.trigger}
              onChange={(e) => setTemplateForm({ ...templateForm, trigger: e.target.value as NotificationTrigger })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="payment_received">{t('notifications.paymentReceived')}</option>
              <option value="occasion_completed">{t('notifications.occasionCompleted')}</option>
              <option value="occasion_created">{t('notifications.occasionCreated')}</option>
              <option value="payment_reminder">{t('notifications.paymentReminder')}</option>
            </select>
          </div>

          <Input
            label={t('notifications.title')}
            value={templateForm.title}
            onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
            placeholder={t('notifications.enterTitle')}
          />

          <div>
            <label className="block text-sm font-medium mb-2">{t('notifications.body')}</label>
            <textarea
              value={templateForm.body}
              onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
              placeholder={t('notifications.enterBody')}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <Input
            label={t('notifications.imageUrl')}
            value={templateForm.imageUrl}
            onChange={(e) => setTemplateForm({ ...templateForm, imageUrl: e.target.value })}
            placeholder={t('notifications.enterImageUrl')}
          />

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={templateForm.isDefault}
                onChange={(e) => setTemplateForm({ ...templateForm, isDefault: e.target.checked })}
                className="mr-2"
              />
              {t('notifications.setAsDefault')}
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowTemplateModal(false);
                setEditingTemplate(null);
                resetTemplateForm();
              }}
            >
              {t('notifications.cancel')}
            </Button>
            <Button onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}>
              {editingTemplate ? t('notifications.update') : t('notifications.create')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Send Notification Modal */}
      <Modal
        isOpen={showSendModal}
        onClose={() => {
          setShowSendModal(false);
          resetSendForm();
        }}
        title={t('notifications.sendCustomNotification')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('notifications.recipient')}</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipient"
                  checked={!sendToAllUsers}
                  onChange={() => setSendToAllUsers(false)}
                  className="mr-2"
                />
                {t('notifications.sendToSpecificUsers')}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipient"
                  checked={sendToAllUsers}
                  onChange={() => setSendToAllUsers(true)}
                  className="mr-2"
                />
                {t('notifications.sendToAllUsers')}
              </label>
            </div>
          </div>

          {!sendToAllUsers && (
            <div>
              <label className="block text-sm font-medium mb-2">{t('notifications.usersList')}</label>
              <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {user.name} ({user.email})
                    </span>
                  </label>
                ))}
              </div>
              {selectedUsers.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {t('notifications.selectedUsersList')}: {selectedUsers.length}
                </p>
              )}
            </div>
          )}

          <Input
            label={t('notifications.title')}
            value={sendForm.title}
            onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
            placeholder={t('notifications.enterTitle')}
          />

          <div>
            <label className="block text-sm font-medium mb-2">{t('notifications.body')}</label>
            <textarea
              value={sendForm.body}
              onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })}
              placeholder={t('notifications.enterBody')}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <Input
            label={t('notifications.imageUrl')}
            value={sendForm.imageUrl}
            onChange={(e) => setSendForm({ ...sendForm, imageUrl: e.target.value })}
            placeholder={t('notifications.enterImageUrl')}
          />

          <Input
            label={t('notifications.scheduleFor')}
            type="datetime-local"
            value={sendForm.scheduledAt}
            onChange={(e) => setSendForm({ ...sendForm, scheduledAt: e.target.value })}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSendModal(false);
                resetSendForm();
              }}
            >
              {t('notifications.cancel')}
            </Button>
            <Button onClick={handleSendNotification} disabled={!canSendNotification}>
              {t('notifications.send')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Trigger Notification Modal */}
      <Modal
        isOpen={showTriggerModal}
        onClose={() => {
          setShowTriggerModal(false);
          resetTriggerForm();
        }}
        title={t('notifications.triggerEventNotification')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('notifications.selectTrigger')}</label>
            <select
              value={selectedTriggerForSend}
              onChange={(e) => setSelectedTriggerForSend(e.target.value as NotificationTrigger)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="payment_received">{t('notifications.paymentReceived')}</option>
              <option value="occasion_completed">{t('notifications.occasionCompleted')}</option>
              <option value="occasion_created">{t('notifications.occasionCreated')}</option>
              <option value="payment_reminder">{t('notifications.paymentReminder')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('notifications.usersList')}</label>
            <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
              {users.map((user) => (
                <label key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">
                    {user.name} ({user.email})
                  </span>
                </label>
              ))}
            </div>
            {selectedUsers.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {t('notifications.selectedUsersList')}: {selectedUsers.length}
              </p>
            )}
          </div>

          {getTriggerVariables(selectedTriggerForSend).map((variable) => (
            <Input
              key={variable}
              label={variable}
              value={triggerVariables[variable] || ''}
              onChange={(e) => setTriggerVariables({ ...triggerVariables, [variable]: e.target.value })}
              placeholder={`${t('notifications.enterVariableValue')}: ${variable}`}
            />
          ))}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowTriggerModal(false);
                resetTriggerForm();
              }}
            >
              {t('notifications.cancel')}
            </Button>
            <Button onClick={handleTriggerNotification}>
              {t('notifications.triggerAction')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

