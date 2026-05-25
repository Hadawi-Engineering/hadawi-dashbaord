import { useCallback, useEffect, useState } from 'react';
import type {
  NotificationHistory,
  NotificationDeliveryStatistics,
  NotificationTrigger,
  NotificationDeliveryStatus,
} from '../../types';
import adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../ui/Toast';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import Table from '../ui/Table';
import Pagination from '../ui/Pagination';
import { StatCard } from '../ui/StatCard';
import { Bell, CheckCircle, XCircle } from 'lucide-react';
import { ALL_TRIGGERS, getTriggerLabel, extractApiErrorMessage } from './notificationHelpers';

const PAGE_SIZE = 20;

export default function NotificationHistoryTab() {
  const { t } = useLanguage();
  const { showError } = useToast();

  const [items, setItems] = useState<NotificationHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<NotificationDeliveryStatistics | null>(null);

  const [triggerFilter, setTriggerFilter] = useState<NotificationTrigger | 'custom' | ''>('');
  const [statusFilter, setStatusFilter] = useState<NotificationDeliveryStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [historyResult, statsData] = await Promise.all([
        adminService.getNotificationHistory({
          page,
          limit: PAGE_SIZE,
          trigger: triggerFilter || undefined,
          deliveryStatus: statusFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        adminService.getNotificationDeliveryStatistics({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);
      setItems(historyResult.items);
      setTotal(historyResult.total);
      setStats(statsData);
    } catch (error) {
      showError(extractApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, triggerFilter, statusFilter, startDate, endDate, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const getDeliveryStatus = (item: NotificationHistory): NotificationDeliveryStatus => {
    return item.deliveryStatus ?? item.status ?? 'pending';
  };

  const statusBadgeVariant = (status: string) => {
    if (status === 'sent') return 'success';
    if (status === 'failed') return 'destructive';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('notifications.notificationHistory')}</h2>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title={t('notifications.totalSent')}
            value={String(stats.totalSent ?? 0)}
            icon={CheckCircle}
          />
          <StatCard
            title={t('notifications.totalFailed')}
            value={String(stats.totalFailed ?? 0)}
            icon={XCircle}
          />
          <StatCard
            title={t('notifications.deliveryRate')}
            value={
              stats.deliveryRate != null
                ? `${Math.round(Number(stats.deliveryRate) * 100) / 100}%`
                : '—'
            }
            icon={Bell}
          />
        </div>
      )}

      <Card className="p-4">
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={triggerFilter}
            onChange={(e) => { setTriggerFilter(e.target.value as NotificationTrigger | 'custom' | ''); setPage(1); }}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">{t('notifications.allTriggers')}</option>
            {ALL_TRIGGERS.map((tr) => (
              <option key={tr} value={tr}>{getTriggerLabel(tr, t)}</option>
            ))}
            <option value="custom">{t('notifications.customTrigger')}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as NotificationDeliveryStatus | ''); setPage(1); }}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">{t('notifications.allStatuses')}</option>
            <option value="sent">{t('notifications.statusCompleted')}</option>
            <option value="failed">{t('notifications.statusFailed')}</option>
            <option value="pending">{t('notifications.statusPending')}</option>
            <option value="cancelled">{t('notifications.statusCancelled')}</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-lg text-sm"
            placeholder={t('notifications.startDate')}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-lg text-sm"
            placeholder={t('notifications.endDateFilter')}
          />
        </div>

        <Table loading={loading}>
          <Table.Head>
            <Table.Row>
              <Table.Th>{t('notifications.title')}</Table.Th>
              <Table.Th>{t('notifications.body')}</Table.Th>
              <Table.Th>{t('notifications.triggerFilter')}</Table.Th>
              <Table.Th>{t('notifications.deliveryStatus')}</Table.Th>
              <Table.Th>{t('notifications.sentAt')}</Table.Th>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {items.length === 0 && !loading ? (
              <Table.Row>
                <Table.Td colSpan={5} className="text-center text-gray-500 py-8">
                  {t('notifications.noHistory')}
                </Table.Td>
              </Table.Row>
            ) : (
              items.map((item) => {
                const status = getDeliveryStatus(item);
                return (
                  <Table.Row key={item.id}>
                    <Table.Td>
                      <span className="font-medium line-clamp-1">{item.title}</span>
                    </Table.Td>
                    <Table.Td>
                      <span className="text-gray-600 line-clamp-2 text-sm">{item.body}</span>
                    </Table.Td>
                    <Table.Td>
                      {item.trigger ? getTriggerLabel(item.trigger as NotificationTrigger, t) : '—'}
                    </Table.Td>
                    <Table.Td>
                      <Badge variant={statusBadgeVariant(status) as 'success' | 'destructive' | 'secondary'}>
                        {status}
                      </Badge>
                    </Table.Td>
                    <Table.Td dir="ltr">{new Date(item.sentAt).toLocaleString()}</Table.Td>
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
    </div>
  );
}
