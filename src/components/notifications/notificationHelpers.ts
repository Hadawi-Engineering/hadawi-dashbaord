import type { NotificationScheduleType, NotificationTrigger, ScheduleStatus } from '../../types';

export type SendMode = 'now' | NotificationScheduleType;

export const RECURRING_SCHEDULE_TYPES: NotificationScheduleType[] = [
  'daily',
  'every_3_days',
  'weekly',
  'monthly',
];

export function isRecurringScheduleType(type: NotificationScheduleType): boolean {
  return RECURRING_SCHEDULE_TYPES.includes(type);
}

export function getTriggerLabel(trigger: NotificationTrigger, t: (key: string) => string): string {
  const map: Record<NotificationTrigger, string> = {
    payment_received: t('notifications.paymentReceived'),
    occasion_completed: t('notifications.occasionCompleted'),
    occasion_created: t('notifications.occasionCreated'),
    payment_reminder: t('notifications.paymentReminder'),
    occasion_reminder: t('notifications.occasionReminder'),
    user_followed: t('notifications.userFollowed'),
    custom: t('notifications.customTrigger'),
  };
  return map[trigger] ?? trigger;
}

export function getScheduleTypeLabel(type: NotificationScheduleType, t: (key: string) => string): string {
  const map: Record<NotificationScheduleType, string> = {
    once: t('notifications.scheduleOnce'),
    daily: t('notifications.scheduleDaily'),
    every_3_days: t('notifications.scheduleEvery3Days'),
    weekly: t('notifications.scheduleWeekly'),
    monthly: t('notifications.scheduleMonthly'),
  };
  return map[type] ?? type;
}

export function getScheduleStatusLabel(status: ScheduleStatus, t: (key: string) => string): string {
  const map: Record<ScheduleStatus, string> = {
    pending: t('notifications.statusPending'),
    active: t('notifications.statusActive'),
    completed: t('notifications.statusCompleted'),
    cancelled: t('notifications.statusCancelled'),
    failed: t('notifications.statusFailed'),
  };
  return map[status] ?? status;
}

export function getTriggerVariables(trigger: NotificationTrigger): string[] {
  const variables: Record<NotificationTrigger, string[]> = {
    payment_received: ['occasionName', 'amount', 'payerName', 'occasionId', 'occasionType'],
    occasion_completed: ['occasionName', 'totalAmount', 'occasionId', 'completionDate'],
    occasion_created: ['occasionName', 'occasionType', 'occasionId', 'creatorName'],
    payment_reminder: ['occasionName', 'remainingAmount', 'occasionId', 'daysLeft'],
    occasion_reminder: ['occasionName', 'occasionId', 'daysLeft'],
    user_followed: ['followerName', 'userName'],
    custom: [],
  };
  return variables[trigger] ?? [];
}

export const ALL_TRIGGERS: NotificationTrigger[] = [
  'payment_received',
  'occasion_completed',
  'occasion_created',
  'payment_reminder',
  'occasion_reminder',
  'user_followed',
  'custom',
];

export function extractApiErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { message?: string | string[] } }; message?: string };
  const msg = err.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return err.message ?? 'An error occurred';
}
