import { useEffect, useState } from 'react';
import type { ScheduledNotification, NotificationScheduleType } from '../../types';
import adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { isRecurringScheduleType, extractApiErrorMessage } from './notificationHelpers';
import {
  localRiyadhToUtcIso,
  localRiyadhEndOfDayToUtcIso,
  isFutureUtc,
  minScheduleDateLocal,
  utcIsoToRiyadhDateTime,
} from '../../utils/notificationDatetime';

interface NotificationScheduleEditModalProps {
  schedule: ScheduledNotification | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function NotificationScheduleEditModal({
  schedule,
  isOpen,
  onClose,
  onSaved,
}: NotificationScheduleEditModalProps) {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scheduleType, setScheduleType] = useState<NotificationScheduleType>('once');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (schedule && isOpen) {
      setTitle(schedule.title);
      setBody(schedule.body);
      setScheduleType(schedule.scheduleType);
      const { date, time } = utcIsoToRiyadhDateTime(schedule.scheduledAt);
      setStartDate(date);
      setStartTime(time);
      if (schedule.endAt) {
        setEndDate(utcIsoToRiyadhDateTime(schedule.endAt).date);
      } else {
        setEndDate('');
      }
    }
  }, [schedule, isOpen]);

  const showEndDate = isRecurringScheduleType(scheduleType);

  const handleSave = async () => {
    if (!schedule) return;
    if (!title.trim() || !body.trim()) {
      showError(t('notifications.fillTitleBody'));
      return;
    }
    if (!startDate || !startTime) {
      showError(t('notifications.startDateTime'));
      return;
    }

    const scheduledAt = localRiyadhToUtcIso(startDate, startTime);
    if (!isFutureUtc(scheduledAt)) {
      showError(t('notifications.scheduledAtMustBeFuture'));
      return;
    }

    const payload: Parameters<typeof adminService.updateNotificationSchedule>[1] = {
      title: title.trim(),
      body: body.trim(),
      scheduleType,
      scheduledAt,
    };

    if (showEndDate && endDate) {
      const endAt = localRiyadhEndOfDayToUtcIso(endDate);
      if (new Date(endAt) <= new Date(scheduledAt)) {
        showError(t('notifications.endAtMustBeAfterStart'));
        return;
      }
      payload.endAt = endAt;
    }

    setSaving(true);
    try {
      await adminService.updateNotificationSchedule(schedule.id, payload);
      showSuccess(t('common.save'));
      onSaved();
      onClose();
    } catch (error) {
      showError(extractApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (!schedule) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('notifications.editScheduleTitle')} size="md">
      <div className="space-y-4">
        <Input label={t('notifications.title')} value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="block text-sm font-medium mb-1">{t('notifications.body')}</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            rows={3}
            dir="auto"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('notifications.scheduleType')}</label>
          <select
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value as NotificationScheduleType)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="once">{t('notifications.scheduleOnce')}</option>
            <option value="daily">{t('notifications.scheduleDaily')}</option>
            <option value="every_3_days">{t('notifications.scheduleEvery3Days')}</option>
            <option value="weekly">{t('notifications.scheduleWeekly')}</option>
            <option value="monthly">{t('notifications.scheduleMonthly')}</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('notifications.date')}</label>
            <input
              type="date"
              value={startDate}
              min={minScheduleDateLocal()}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('notifications.time')}</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
        {showEndDate && (
          <div>
            <label className="block text-sm font-medium mb-1">{t('notifications.endDate')}</label>
            <input
              type="date"
              value={endDate}
              min={startDate || minScheduleDateLocal()}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
