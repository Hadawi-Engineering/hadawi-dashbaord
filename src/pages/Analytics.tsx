import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Users, Calendar, Tag, Image, Wallet, Calculator, Package, BarChart3 } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';

export default function Analytics() {
  const { t, isRTL } = useLanguage();
  const [period, setPeriod] = useState<string>('month');

  // Fetch all statistics
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['revenue-analytics', period],
    queryFn: () => adminService.getRevenueAnalytics({ page: 1, limit: 10 }),
  });

  const { data: dashboardStats, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboard-stats-analytics'],
    queryFn: () => adminService.getDashboardStats(),
  });

  const { data: paymentStats, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: () => adminService.getPaymentStats(),
  });

  const { data: occasionTypesStats, isLoading: isLoadingOccasionTypes } = useQuery({
    queryKey: ['occasion-types-stats'],
    queryFn: () => adminService.getOccasionTypesStatistics(),
  });

  const { data: taxStats, isLoading: isLoadingTaxes } = useQuery({
    queryKey: ['tax-stats'],
    queryFn: () => adminService.getTaxStatistics(),
  });

  const { data: packagingStats, isLoading: isLoadingPackaging } = useQuery({
    queryKey: ['packaging-stats'],
    queryFn: () => adminService.getPackagingStatistics(),
  });

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Prepare chart data
  const monthlyData = revenueData?.byMonth?.map((value, index) => ({
    month: isRTL ? `شهر ${index + 1}` : `Month ${index + 1}`,
    revenue: value,
  })) || [];

  // If no byMonth data, create a simple chart with total revenue
  const chartData = monthlyData.length > 0 ? monthlyData : [
    {
      month: isRTL ? 'الإيرادات' : 'Revenue',
      revenue: revenueData?.total || 0,
    }
  ];

  const categoryData = revenueData?.byCategory 
    ? Object.entries(revenueData.byCategory).map(([name, value]) => ({
        name,
        value: Number(value),
      }))
    : [];

  // Prepare tax breakdown data
  const taxBreakdownData = taxStats?.byType?.map((item) => ({
    name: t(`taxes.types.${item.type}`),
    value: item.count,
  })) || [];

  // Prepare packaging breakdown data
  const packagingBreakdownData = packagingStats?.byStatus?.map((item) => ({
    name: t(`packaging.status.${item.status}`),
    value: item.count,
  })) || [];

  const isLoading = isLoadingRevenue || isLoadingDashboard || isLoadingPayments || 
                   isLoadingOccasionTypes || isLoadingTaxes || isLoadingPackaging;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
        <span className={`text-gray-600 ${isRTL ? 'mr-3' : 'ml-3'}`}>{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('analytics.title')}</h1>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? 'primary' : 'secondary'}
              onClick={() => setPeriod(p)}
            >
              {p === 'week' ? t('analytics.last7Days') : p === 'month' ? t('analytics.last30Days') : t('analytics.lastYear')}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('dashboard.totalUsers')}
          value={dashboardStats?.users?.total?.toLocaleString() || '0'}
          icon={Users}
          change={undefined}
          trend={undefined}
        />
        <StatCard
          title={t('dashboard.totalRevenue')}
          value={`${dashboardStats?.payments?.totalAmount?.toLocaleString() || '0'} SAR`}
          icon={DollarSign}
          change={undefined}
          trend={undefined}
        />
        <StatCard
          title={t('dashboard.totalPayments')}
          value={dashboardStats?.payments?.total?.toLocaleString() || '0'}
          icon={BarChart3}
          change={undefined}
          trend={undefined}
        />
        <StatCard
          title={t('dashboard.totalOccasions')}
          value={dashboardStats?.occasions?.total?.toLocaleString() || '0'}
          icon={Calendar}
          change={undefined}
          trend={undefined}
        />
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('dashboard.totalPromoCodes')}
          value={dashboardStats?.promoCodes?.total?.toLocaleString() || '0'}
          icon={Tag}
          change={undefined}
          trend={undefined}
        />
        <StatCard
          title={t('dashboard.totalBanners')}
          value={dashboardStats?.banners?.total?.toLocaleString() || '0'}
          icon={Image}
          change={undefined}
          trend={undefined}
        />
        <StatCard
          title={t('dashboard.pendingWithdrawals')}
          value={dashboardStats?.withdrawals?.pending?.toLocaleString() || '0'}
          icon={Wallet}
          change={undefined}
          trend={undefined}
        />
        <StatCard
          title={t('taxes.totalTaxes')}
          value={taxStats?.total?.toLocaleString() || '0'}
          icon={Calculator}
          change={undefined}
          trend={undefined}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('analytics.revenue')}</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => `${value.toLocaleString()} SAR`}
              labelStyle={{ direction: isRTL ? 'rtl' : 'ltr' }}
            />
            <Bar dataKey="revenue" fill="#766689" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('analytics.revenue')}</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">{t('common.noData')}</p>
          )}
        </Card>

        {/* Tax Breakdown */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('taxes.breakdown')}</h2>
          {taxBreakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taxBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taxBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">{t('common.noData')}</p>
          )}
        </Card>
      </div>

      {/* Packaging Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('packaging.breakdown')}</h2>
          {packagingBreakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={packagingBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {packagingBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">{t('common.noData')}</p>
          )}
        </Card>

        {/* Summary Stats */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('analytics.revenue')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{t('dashboard.totalRevenue')}</span>
              <span className="font-bold text-gray-900">
                {revenueData?.total?.toLocaleString() || '0'} SAR
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{t('analytics.growth')}</span>
              <span className={`font-bold ${revenueData?.growth?.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                {revenueData?.growth || '0%'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{t('dashboard.totalUsers')}</span>
              <span className="font-bold text-gray-900">
                {dashboardStats?.users?.total?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{t('dashboard.totalOccasions')}</span>
              <span className="font-bold text-gray-900">
                {dashboardStats?.occasions?.total?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
