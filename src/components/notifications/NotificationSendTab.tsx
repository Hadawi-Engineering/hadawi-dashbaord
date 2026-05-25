import { useState } from 'react';
import type { User, NotificationScheduleType, SendNotificationPayload } from '../../types';
import adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../ui/Toast';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import RecipientSelector from './RecipientSelector';
import NotificationPreview from './NotificationPreview';
import {
  SendMode,
  isRecurringScheduleType,
  getTriggerVariables,
  ALL_TRIGGERS,
  extractApiErrorMessage,
} from './notificationHelpers';
import type { NotificationTrigger } from '../../types';
import {
  localRiyadhToUtcIso,
  localRiyadhEndOfDayToUtcIso,
  isFutureUtc,
  minScheduleDateLocal,
  formatScheduleDisplay,
} from '../../utils/notificationDatetime';

interface NotificationSendTabProps {
  users: User[];
  onScheduled?: () => void;
}

export default function NotificationSendTab({ users, onScheduled }: NotificationSendTabProps) {
  const { t, language } = useLanguage();
  const { showSuccess, showError } = useToast();

  const [sendToAll, setSendToAll] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sendMode, setSendMode] = useState<SendMode>('now');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<NotificationTrigger>('payment_received');
  const [triggerVariables, setTriggerVariables] = useState<Record<string, string>>({});
  const [triggerUserIds, setTriggerUserIds] = useState<string[]>([]);

  const [daysInactive, setDaysInactive] = useState(30);
  const [sendingReminders, setSendingReminders] = useState(false);

  const isScheduled = sendMode !== 'now';
  const showEndDate = isScheduled && isRecurringScheduleType(sendMode as NotificationScheduleType);

  const buildPayload = (): SendNotificationPayload | null => {
    if (!title.trim() || !body.trim()) {
      showError(t('notifications.fillTitleBody'));
      return null;
    }
    if (!sendToAll && selectedUserIds.length === 0) {
      showError(t('notifications.selectRecipients'));
      return null;
    }

    const payload: SendNotificationPayload = {
      userIds: sendToAll ? ['all'] : selectedUserIds,
      title: title.trim(),
      body: body.trim(),
      imageUrl: imageUrl.trim() || undefined,
    };

    if (isScheduled) {
      if (!startDate || !startTime) {
        showError(t('notifications.startDateTime'));
        return null;
      }
      const scheduledAt = localRiyadhToUtcIso(startDate, startTime);
      if (!isFutureUtc(scheduledAt)) {
        showError(t('notifications.scheduledAtMustBeFuture'));
        return null;
      }
      payload.scheduleType = sendMode as NotificationScheduleType;
      payload.scheduledAt = scheduledAt;

      if (showEndDate && endDate) {
        const endAt = localRiyadhEndOfDayToUtcIso(endDate);
        if (new Date(endAt) <= new Date(scheduledAt)) {
          showError(t('notifications.endAtMustBeAfterStart'));
          return null;
        }
        payload.endAt = endAt;
      }
    }

    return payload;
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload) return;

    if (payload.userIds.includes('all') && !window.confirm(t('notifications.confirmBroadcast'))) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await adminService.sendDashboardNotification(payload);
      if (payload.scheduledAt && result.data?.nextRunAt) {
        const nextRun = formatScheduleDisplay(result.data.nextRunAt, language === 'ar' ? 'ar' : 'en');
        showSuccess(
          t('notifications.scheduledSuccess').replace('{{nextRunAt}}', nextRun) ||
            result.message
        );
        onScheduled?.();
      } else {
        showSuccess(
          t('notifications.sentSuccess')
            .replace('{{sent}}', String(result.sent ?? 0))
            .replace('{{failed}}', String(result.failed ?? 0)) || result.message
        );
      }
      resetForm();
    } catch (error) {
      showError(extractApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setImageUrl('');
    setSendMode('now');
    setStartDate('');
    setStartTime('09:00');
    setEndDate('');
    setSendToAll(false);
    setSelectedUserIds([]);
  };

  const handleTrigger = async () => {
    if (triggerUserIds.length === 0) {
      showError(t('notifications.selectRecipients'));
      return;
    }
    try {
      await adminService.triggerEventNotification(selectedTrigger, {
        userIds: triggerUserIds,
        variables: triggerVariables,
      });
      showSuccess(t('notifications.sendNowButton'));
      setShowTriggerModal(false);
      setTriggerUserIds([]);
      setTriggerVariables({});
    } catch (error) {
      showError(extractApiErrorMessage(error));
    }
  };

  const handleInactiveReminders = async () => {
    if (!window.confirm(t('notifications.confirmSendReminders'))) return;
    setSendingReminders(true);
    try {
      const admin = adminService.getCurrentAdmin();
      if (!admin) {
        showError(t('common.error'));
        return;
      }
      const result = await adminService.sendInactiveUserReminder(daysInactive, admin.id);
      showSuccess(t('notifications.remindersSentSuccess').replace('{{count}}', String(result.count)));
    } catch (error) {
      showError(extractApiErrorMessage(error));
    } finally {
      setSendingReminders(false);
    }
  };

  const scheduleModes: { value: SendMode; label: string }[] = [
    { value: 'now', label: t('notifications.sendNow') },
    { value: 'daily', label: t('notifications.scheduleDaily') },
    { value: 'every_3_days', label: t('notifications.scheduleEvery3Days') },
    { value: 'weekly', label: t('notifications.scheduleWeekly') },
    { value: 'monthly', label: t('notifications.scheduleMonthly') },
    { value: 'once', label: t('notifications.scheduleOnce') },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('notifications.sendNotifications')}</h2>

        <div className="space-y-6 max-w-2xl">
          <RecipientSelector
            users={users}
            sendToAll={sendToAll}
            selectedUserIds={selectedUserIds}
            onSendToAllChange={setSendToAll}
            onSelectedUsersChange={setSelectedUserIds}
          />

          <Input
            label={t('notifications.title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('notifications.enterTitle')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('notifications.body')}</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('notifications.enterBody')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={4}
              dir="auto"
            />
          </div>

          <Input
            label={t('notifications.imageUrl')}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={t('notifications.enterImageUrl')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('notifications.whenToSend')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {scheduleModes.map((mode) => (
                <label
                  key={mode.value}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer text-sm ${
                    sendMode === mode.value
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="sendMode"
                    checked={sendMode === mode.value}
                    onChange={() => setSendMode(mode.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  {mode.label}
                </label>
              ))}
            </div>
          </div>

          {isScheduled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('notifications.date')}</label>
                <input
                  type="date"
                  value={startDate}
                  min={minScheduleDateLocal()}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('notifications.time')}</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {showEndDate && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('notifications.endDate')}</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || minScheduleDateLocal()}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)}>
              {t('notifications.preview')}
            </Button>
            <Button onClick={handleSubmit} loading={submitting} disabled={submitting}>
              {isScheduled ? t('notifications.scheduleButton') : t('notifications.sendNowButton')}
            </Button>
          </div>

          {showPreview && (
            <NotificationPreview title={title} body={body} imageUrl={imageUrl} />
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">{t('notifications.triggerEventNotification')}</h3>
          <p className="text-gray-600 text-sm mb-4">{t('notifications.triggerNotificationDescription')}</p>
          <Button variant="outline" onClick={() => setShowTriggerModal(true)}>
            {t('notifications.triggerEvent')}
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">{t('notifications.inactiveReminders')}</h3>
          <p className="text-gray-600 text-sm mb-4">{t('notifications.inactiveRemindersDescription')}</p>
          <div className="flex items-end gap-4">
            <Input
              label={t('notifications.daysInactive')}
              type="number"
              value={daysInactive}
              onChange={(e) => setDaysInactive(parseInt(e.target.value, 10) || 30)}
              min={1}
            />
            <Button onClick={handleInactiveReminders} loading={sendingReminders} className="mb-1">
              {t('notifications.sendReminders')}
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showTriggerModal}
        onClose={() => setShowTriggerModal(false)}
        title={t('notifications.triggerEventNotification')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('notifications.selectTrigger')}</label>
            <select
              value={selectedTrigger}
              onChange={(e) => setSelectedTrigger(e.target.value as NotificationTrigger)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {ALL_TRIGGERS.map((tr) => (
                <option key={tr} value={tr}>
                  {tr.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('notifications.usersList')}</label>
            <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
              {users.map((user) => (
                <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={triggerUserIds.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTriggerUserIds([...triggerUserIds, user.id]);
                      } else {
                        setTriggerUserIds(triggerUserIds.filter((id) => id !== user.id));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{user.name} ({user.email})</span>
                </label>
              ))}
            </div>
          </div>

          {getTriggerVariables(selectedTrigger).map((variable) => (
            <Input
              key={variable}
              label={variable}
              value={triggerVariables[variable] || ''}
              onChange={(e) => setTriggerVariables({ ...triggerVariables, [variable]: e.target.value })}
              placeholder={`${t('notifications.enterVariableValue')}: ${variable}`}
            />
          ))}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowTriggerModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleTrigger}>{t('notifications.triggerAction')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
