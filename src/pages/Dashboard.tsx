import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => adminService.getDashboardStats(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
        <span className="mr-3 text-gray-600">{t('common.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {t('common.error')}
      </div>
    );
  }

  // Prepare chart data (mock data for now since API doesn't provide it)
  const chartData = [
    { name: 'Jan', revenue: 0 },
    { name: 'Feb', revenue: 0 },
    { name: 'Mar', revenue: 0 },
    { name: 'Apr', revenue: 0 },
    { name: 'May', revenue: 0 },
    { name: 'Jun', revenue: stats?.payments?.totalAmount || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-sm text-gray-500">
          {t('dashboard.lastUpdate')}: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('dashboard.totalUsers')}
          value={stats?.users?.total?.toLocaleString() || '0'}
          icon={Users}
          change={`${stats?.users?.active || 0} ${t('common.active')}`}
        />
        
        <StatCard
          title={t('dashboard.activeOccasions')}
          value={stats?.occasions?.total?.toLocaleString() || '0'}
          icon={Calendar}
        />
        
        <StatCard
          title={t('dashboard.totalRevenue')}
          value={`${stats?.payments?.totalAmount?.toLocaleString() || '0'} SAR`}
          icon={DollarSign}
        />
        
        <StatCard
          title={t('dashboard.todayPayments')}
          value={stats?.payments?.total?.toLocaleString() || '0'}
          icon={CreditCard}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.monthlyRevenue')}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              formatter={(value: number) => `${value.toLocaleString()} SAR`}
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #766689',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#766689" 
              strokeWidth={3}
              dot={{ fill: '#766689', r: 5 }}
              activeDot={{ r: 7, fill: '#6b5c7b' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Summary */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.summary')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">{t('nav.promoCodes')}</p>
                <p className="text-sm text-gray-500">{stats?.promoCodes?.active || 0} {t('common.active')}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{stats?.promoCodes?.total || 0}</p>
                <p className="text-sm text-gray-500">{t('common.total')}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">{t('nav.banners')}</p>
                <p className="text-sm text-gray-500">{stats?.banners?.active || 0} {t('common.active')}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{stats?.banners?.total || 0}</p>
                <p className="text-sm text-gray-500">{t('common.total')}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">{t('nav.deliveryPartners')}</p>
                <p className="text-sm text-gray-500">{stats?.deliveryPartners?.active || 0} {t('common.active')}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{stats?.deliveryPartners?.total || 0}</p>
                <p className="text-sm text-gray-500">{t('common.total')}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Withdrawals Summary */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('nav.withdrawals')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">{t('withdrawals.pending')}</p>
                <p className="text-sm text-gray-500">Waiting for approval</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{stats?.withdrawals?.pending || 0}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">{t('withdrawals.approved')}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{stats?.withdrawals?.approved || 0}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">{t('common.total')} {t('withdrawals.amount')}</p>
                <p className="text-sm text-gray-500">Total withdrawal amount</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{stats?.withdrawals?.totalAmount?.toLocaleString() || 0} SAR</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
