import type { ScheduledNotification } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import {
  getScheduleTypeLabel,
  getScheduleStatusLabel,
} from './notificationHelpers';
import { formatScheduleDisplay, SCHEDULE_STATUS_COLORS } from '../../utils/notificationDatetime';

interface NotificationScheduleDetailModalProps {
  schedule: ScheduledNotification | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationScheduleDetailModal({
  schedule,
  isOpen,
  onClose,
}: NotificationScheduleDetailModalProps) {
  const { t, language } = useLanguage();
  if (!schedule) return null;

  const locale = language === 'ar' ? 'ar' : 'en';
  const statusColor = SCHEDULE_STATUS_COLORS[schedule.status] ?? 'gray';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('notifications.scheduleDetails')} size="md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{schedule.title}</h3>
          <Badge color={statusColor as 'gray' | 'green' | 'blue' | 'red' | 'yellow'}>
            {getScheduleStatusLabel(schedule.status, t)}
          </Badge>
        </div>

        <p className="text-gray-700 whitespace-pre-wrap" dir="auto">{schedule.body}</p>

        {schedule.imageUrl && (
          <img src={schedule.imageUrl} alt="" className="rounded-lg max-h-32 object-cover" />
        )}

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">{t('notifications.scheduleType')}</dt>
            <dd className="font-medium">{getScheduleTypeLabel(schedule.scheduleType, t)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('notifications.runCount')}</dt>
            <dd className="font-medium">{schedule.runCount}</dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('notifications.nextRun')}</dt>
            <dd className="font-medium" dir="ltr">{formatScheduleDisplay(schedule.nextRunAt, locale)}</dd>
          </div>
          {schedule.lastRunAt && (
            <div>
              <dt className="text-gray-500">{t('notifications.lastRun')}</dt>
              <dd className="font-medium" dir="ltr">{formatScheduleDisplay(schedule.lastRunAt, locale)}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">{t('notifications.startDateTime')}</dt>
            <dd className="font-medium" dir="ltr">{formatScheduleDisplay(schedule.scheduledAt, locale)}</dd>
          </div>
          {schedule.endAt && (
            <div>
              <dt className="text-gray-500">{t('notifications.endDate')}</dt>
              <dd className="font-medium" dir="ltr">{formatScheduleDisplay(schedule.endAt, locale)}</dd>
            </div>
          )}
          <div className="col-span-2">
            <dt className="text-gray-500">{t('notifications.recipients')}</dt>
            <dd className="font-medium">
              {schedule.userIds.includes('all')
                ? t('notifications.sendToAllUsers')
                : `${schedule.userIds.length} ${t('notifications.sendToSpecificUsers').toLowerCase()}`}
            </dd>
          </div>
        </dl>

        {schedule.failureReason && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-900">
            <strong>{t('notifications.failureReason')}:</strong> {schedule.failureReason}
          </div>
        )}
      </div>
    </Modal>
  );
}
