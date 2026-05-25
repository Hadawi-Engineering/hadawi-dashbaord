import { useCallback, useEffect, useState } from 'react';
import type { ScheduledNotification, ScheduleStatus, NotificationScheduleType } from '../../types';
import adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../ui/Toast';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import Table from '../ui/Table';
import Pagination from '../ui/Pagination';
import NotificationScheduleDetailModal from './NotificationScheduleDetailModal';
import NotificationScheduleEditModal from './NotificationScheduleEditModal';
import {
  getScheduleTypeLabel,
  getScheduleStatusLabel,
  extractApiErrorMessage,
} from './notificationHelpers';
import { formatScheduleDisplay, SCHEDULE_STATUS_COLORS } from '../../utils/notificationDatetime';

const POLL_INTERVAL_MS = 60_000;
const PAGE_SIZE = 20;

export default function NotificationScheduledTab() {
  const { t, language } = useLanguage();
  const { showSuccess, showError } = useToast();
  const locale = language === 'ar' ? 'ar' : 'en';

  const [schedules, setSchedules] = useState<ScheduledNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<NotificationScheduleType | ''>('');

  const [detailSchedule, setDetailSchedule] = useState<ScheduledNotification | null>(null);
  const [editSchedule, setEditSchedule] = useState<ScheduledNotification | null>(null);

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getNotificationSchedules({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        scheduleType: typeFilter || undefined,
      });
      setSchedules(result.schedules);
      setTotal(result.total);
    } catch (error) {
      showError(extractApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, showError]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    const interval = setInterval(loadSchedules, POLL_INTERVAL_MS);
    const onFocus = () => loadSchedules();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadSchedules]);

  const handleCancel = async (schedule: ScheduledNotification) => {
    if (!window.confirm(t('notifications.cancelScheduleConfirm'))) return;
    try {
      await adminService.cancelNotificationSchedule(schedule.id);
      showSuccess(t('notifications.statusCancelled'));
      loadSchedules();
    } catch (error) {
      showError(extractApiErrorMessage(error));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('notifications.scheduled')}</h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as ScheduleStatus | ''); setPage(1); }}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">{t('notifications.allStatuses')}</option>
            <option value="pending">{t('notifications.statusPending')}</option>
            <option value="active">{t('notifications.statusActive')}</option>
            <option value="completed">{t('notifications.statusCompleted')}</option>
            <option value="cancelled">{t('notifications.statusCancelled')}</option>
            <option value="failed">{t('notifications.statusFailed')}</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as NotificationScheduleType | ''); setPage(1); }}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">{t('notifications.allScheduleTypes')}</option>
            <option value="once">{t('notifications.scheduleOnce')}</option>
            <option value="daily">{t('notifications.scheduleDaily')}</option>
            <option value="every_3_days">{t('notifications.scheduleEvery3Days')}</option>
            <option value="weekly">{t('notifications.scheduleWeekly')}</option>
            <option value="monthly">{t('notifications.scheduleMonthly')}</option>
          </select>
        </div>
      </div>

      <Card>
        <Table loading={loading}>
          <Table.Head>
            <Table.Row>
              <Table.Th>{t('notifications.title')}</Table.Th>
              <Table.Th>{t('notifications.scheduleType')}</Table.Th>
              <Table.Th>{t('notifications.nextRun')}</Table.Th>
              <Table.Th>{t('notifications.lastRun')}</Table.Th>
              <Table.Th>{t('notifications.runCount')}</Table.Th>
              <Table.Th>{t('notifications.status')}</Table.Th>
              <Table.Th>{t('common.actions')}</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {schedules.length === 0 && !loading ? (
              <Table.Row>
                <Table.Td colSpan={7} className="text-center text-gray-500 py-8">
                  {t('notifications.noSchedules')}
                </Table.Td>
              </Table.Row>
            ) : (
              schedules.map((schedule) => {
                const statusColor = SCHEDULE_STATUS_COLORS[schedule.status] ?? 'gray';
                const canEdit = schedule.status === 'pending';
                const canCancel = schedule.status === 'pending' || schedule.status === 'active';

                return (
                  <Table.Row key={schedule.id}>
                    <Table.Td>
                      <span className="font-medium text-gray-900 line-clamp-1">{schedule.title}</span>
                    </Table.Td>
                    <Table.Td>{getScheduleTypeLabel(schedule.scheduleType, t)}</Table.Td>
                    <Table.Td dir="ltr">{formatScheduleDisplay(schedule.nextRunAt, locale)}</Table.Td>
                    <Table.Td dir="ltr">
                      {schedule.lastRunAt ? formatScheduleDisplay(schedule.lastRunAt, locale) : '—'}
                    </Table.Td>
                    <Table.Td>{schedule.runCount}</Table.Td>
                    <Table.Td>
                      <Badge color={statusColor as 'gray' | 'green' | 'blue' | 'red' | 'yellow'}>
                        {getScheduleStatusLabel(schedule.status, t)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="outline" onClick={() => setDetailSchedule(schedule)}>
                          {t('notifications.viewSchedule')}
                        </Button>
                        {canEdit && (
                          <Button size="sm" variant="secondary" onClick={() => setEditSchedule(schedule)}>
                            {t('notifications.editSchedule')}
                          </Button>
                        )}
                        {canCancel && (
                          <Button size="sm" variant="danger" onClick={() => handleCancel(schedule)}>
                            {t('notifications.cancelSchedule')}
                          </Button>
                        )}
                      </div>
                    </Table.Td>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table>

        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </Card>

      <NotificationScheduleDetailModal
        schedule={detailSchedule}
        isOpen={!!detailSchedule}
        onClose={() => setDetailSchedule(null)}
      />

      <NotificationScheduleEditModal
        schedule={editSchedule}
        isOpen={!!editSchedule}
        onClose={() => setEditSchedule(null)}
        onSaved={loadSchedules}
      />
    </div>
  );
}
