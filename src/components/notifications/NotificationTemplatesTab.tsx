import { useState } from 'react';
import type {
  NotificationTemplate,
  NotificationTemplateCreate,
  NotificationTrigger,
} from '../../types';
import adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../ui/Toast';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { ALL_TRIGGERS, getTriggerLabel, extractApiErrorMessage } from './notificationHelpers';

interface NotificationTemplatesTabProps {
  templates: NotificationTemplate[];
  onRefresh: () => void;
}

export default function NotificationTemplatesTab({
  templates,
  onRefresh,
}: NotificationTemplatesTabProps) {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const [selectedTrigger, setSelectedTrigger] = useState<NotificationTrigger | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [templateForm, setTemplateForm] = useState<NotificationTemplateCreate>({
    name: '',
    description: '',
    trigger: 'payment_received',
    title: '',
    body: '',
    imageUrl: '',
    data: {},
    isDefault: false,
    status: 'active',
  });

  const filteredTemplates = selectedTrigger
    ? templates.filter((tpl) => tpl.trigger === selectedTrigger)
    : templates;

  const resetForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      trigger: 'payment_received',
      title: '',
      body: '',
      imageUrl: '',
      data: {},
      isDefault: false,
      status: 'active',
    });
  };

  const openEdit = (template: NotificationTemplate) => {
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
      status: template.status,
    });
    setShowModal(true);
  };

  const handleCreate = async () => {
    try {
      await adminService.createNotificationTemplate(templateForm);
      showSuccess(t('notifications.create'));
      setShowModal(false);
      resetForm();
      onRefresh();
    } catch (error) {
      showError(extractApiErrorMessage(error));
    }
  };

  const handleUpdate = async () => {
    if (!editingTemplate) return;
    try {
      await adminService.updateNotificationTemplate(editingTemplate.id, templateForm);
      showSuccess(t('notifications.update'));
      setShowModal(false);
      setEditingTemplate(null);
      resetForm();
      onRefresh();
    } catch (error) {
      showError(extractApiErrorMessage(error));
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await adminService.setTemplateAsDefault(id);
      showSuccess(t('notifications.setDefault'));
      onRefresh();
    } catch (error) {
      showError(extractApiErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('common.confirm') + '?')) return;
    try {
      await adminService.deleteNotificationTemplate(id);
      showSuccess(t('notifications.delete'));
      onRefresh();
    } catch (error) {
      showError(extractApiErrorMessage(error));
    }
  };

  const handleInitialize = async () => {
    if (!window.confirm(t('notifications.initializeConfirm'))) return;
    setInitializing(true);
    try {
      await adminService.initializeDefaultTemplates();
      showSuccess(t('notifications.initializeDefaults'));
      onRefresh();
    } catch (error) {
      showError(extractApiErrorMessage(error));
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">{t('notifications.notificationTemplates')}</h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedTrigger}
            onChange={(e) => setSelectedTrigger(e.target.value as NotificationTrigger | '')}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">{t('notifications.allTriggers')}</option>
            {ALL_TRIGGERS.map((tr) => (
              <option key={tr} value={tr}>{getTriggerLabel(tr, t)}</option>
            ))}
          </select>
          <Button variant="outline" onClick={handleInitialize} loading={initializing}>
            {t('notifications.initializeDefaults')}
          </Button>
          <Button onClick={() => { setEditingTemplate(null); resetForm(); setShowModal(true); }}>
            {t('notifications.createTemplate')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{template.name}</h3>
              <div className="flex gap-1 flex-wrap justify-end">
                {template.isDefault && (
                  <Badge variant="success">{t('notifications.default')}</Badge>
                )}
                <Badge variant={template.status === 'active' ? 'success' : 'secondary'}>
                  {template.status}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{template.description}</p>
            <div className="text-sm space-y-1">
              <p><strong>{t('notifications.trigger')}:</strong> {getTriggerLabel(template.trigger, t)}</p>
              <p className="line-clamp-1"><strong>{t('notifications.title')}:</strong> {template.title}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => openEdit(template)}>
                {t('notifications.edit')}
              </Button>
              {!template.isDefault && (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleSetDefault(template.id)}>
                    {t('notifications.setDefault')}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(template.id)}>
                    {t('notifications.delete')}
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTemplate(null); resetForm(); }}
        title={editingTemplate ? t('notifications.editTemplate') : t('notifications.createTemplate')}
      >
        <div className="space-y-4">
          <Input
            label={t('notifications.templateName')}
            value={templateForm.name}
            onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
          />
          <Input
            label={t('notifications.description')}
            value={templateForm.description}
            onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium mb-2">{t('notifications.trigger')}</label>
            <select
              value={templateForm.trigger}
              onChange={(e) => setTemplateForm({ ...templateForm, trigger: e.target.value as NotificationTrigger })}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={!!editingTemplate}
            >
              {ALL_TRIGGERS.map((tr) => (
                <option key={tr} value={tr}>{getTriggerLabel(tr, t)}</option>
              ))}
            </select>
          </div>
          <Input
            label={t('notifications.title')}
            value={templateForm.title}
            onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium mb-2">{t('notifications.body')}</label>
            <textarea
              value={templateForm.body}
              onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              dir="auto"
            />
          </div>
          <Input
            label={t('notifications.imageUrl')}
            value={templateForm.imageUrl}
            onChange={(e) => setTemplateForm({ ...templateForm, imageUrl: e.target.value })}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={templateForm.isDefault}
              onChange={(e) => setTemplateForm({ ...templateForm, isDefault: e.target.checked })}
            />
            {t('notifications.setAsDefault')}
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowModal(false); setEditingTemplate(null); resetForm(); }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={editingTemplate ? handleUpdate : handleCreate}>
              {editingTemplate ? t('notifications.update') : t('notifications.create')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
