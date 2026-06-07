import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Tag,
  Minus,
  Download,
  FileSpreadsheet,
  FileText,
  BarChart2,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import adminService from '../services/adminService';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import MultiSelect from '../components/ui/MultiSelect';
import { useLanguage } from '../contexts/LanguageContext';
import type { SalesReportFilters } from '../types';

const PAGE_SIZE = 20;

const GROUP_BY_OPTIONS = ['day', 'week', 'month', 'brand', 'product', 'category'];

function ReportSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 h-28 flex flex-col gap-3">
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-7 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
      {/* chart */}
      <div className="bg-white rounded-xl p-6 h-80">
        <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
        <div className="h-60 bg-gray-100 rounded" />
      </div>
      {/* top tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
            {[...Array(5)].map((_, j) => (
              <div key={j} className="h-8 bg-gray-100 rounded mb-2" />
            ))}
          </div>
        ))}
      </div>
      {/* transactions */}
      <div className="bg-white rounded-xl p-6 h-64">
        <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
        <div className="h-48 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function SalesReport() {
  const { t, isRTL } = useLanguage();

  // ── Draft filter form state ──
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBrandNames, setSelectedBrandNames] = useState<string[]>([]);
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>([]);
  const [selectedCityNames, setSelectedCityNames] = useState<string[]>([]);
  const [occasionType, setOccasionType] = useState('');
  const [giftType, setGiftType] = useState('');
  const [groupBy, setGroupBy] = useState('month');

  // ── Applied filters (what actually drives the query) ──
  const [appliedFilters, setAppliedFilters] = useState<SalesReportFilters | null>(null);

  // ── Pagination & chart state ──
  const [transPage, setTransPage] = useState(1);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'transactions'>('revenue');

  // ── Export loading ──
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // ── Filter option queries ──
  const { data: brands = [] } = useQuery({
    queryKey: ['brands-list'],
    queryFn: () => adminService.getBrands(),
    staleTime: 10 * 60 * 1000,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-list'],
    queryFn: () => adminService.getProductCategories(),
    staleTime: 10 * 60 * 1000,
  });
  const { data: cities = [] } = useQuery({
    queryKey: ['cities-list'],
    queryFn: () => adminService.getCities(),
    staleTime: 10 * 60 * 1000,
  });

  const brandNames = brands.map((b) => b.nameEn);
  const categoryNames = categories.map((c) => c.nameEn);
  const cityNames = cities.map((c) => c.nameEn);

  // ── Main report query ──
  const filtersWithPage: SalesReportFilters | null = appliedFilters
    ? { ...appliedFilters, page: transPage, pageSize: PAGE_SIZE }
    : null;

  const { data: report, isLoading, isFetching } = useQuery({
    queryKey: ['sales-report', filtersWithPage],
    queryFn: () => adminService.getSalesReport(filtersWithPage!),
    enabled: filtersWithPage !== null,
  });

  // ── Submit / reset ──
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const brandIds = brands
      .filter((b) => selectedBrandNames.includes(b.nameEn))
      .map((b) => b.id);
    const categoryIds = categories
      .filter((c) => selectedCategoryNames.includes(c.nameEn))
      .map((c) => c.id);
    const cityList = cities
      .filter((c) => selectedCityNames.includes(c.nameEn))
      .map((c) => c.nameEn);

    const filters: SalesReportFilters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (brandIds.length) filters.brandIds = brandIds;
    if (categoryIds.length) filters.categoryIds = categoryIds;
    if (cityList.length) filters.cities = cityList;
    if (occasionType) filters.occasionType = occasionType;
    if (giftType) filters.giftType = giftType;
    if (groupBy) filters.groupBy = groupBy;

    setAppliedFilters(filters);
    setTransPage(1);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectedBrandNames([]);
    setSelectedCategoryNames([]);
    setSelectedCityNames([]);
    setOccasionType('');
    setGiftType('');
    setGroupBy('month');
    setAppliedFilters(null);
    setTransPage(1);
  };

  // ── Export ──
  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!appliedFilters) return;
    const setLoading = format === 'excel' ? setExportingExcel : setExportingPdf;
    setLoading(true);
    try {
      const blob = await adminService.exportSalesReport(appliedFilters, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = report
    ? Math.max(1, Math.ceil(report.totalTransactionCount / PAGE_SIZE))
    : 1;

  const labelStyle = 'block text-sm font-medium text-gray-700 mb-1';
  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-3xl font-bold text-gray-900">{t('salesReport.title')}</h1>
        {appliedFilters && (
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleExport('excel')}
              disabled={exportingExcel || !report}
            >
              <FileSpreadsheet size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
              {exportingExcel ? t('common.loading') : t('salesReport.exportExcel')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleExport('pdf')}
              disabled={exportingPdf || !report}
            >
              <FileText size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
              {exportingPdf ? t('common.loading') : t('salesReport.exportPdf')}
            </Button>
          </div>
        )}
      </div>

      {/* ── Filter Bar ── */}
      <Card>
        <form onSubmit={handleApply}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Date range */}
            <div>
              <label className={labelStyle}>{t('salesReport.startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelStyle}>{t('salesReport.endDate')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Brands */}
            <div>
              <MultiSelect
                label={t('brands.title')}
                options={brandNames}
                value={selectedBrandNames}
                onChange={setSelectedBrandNames}
                placeholder={t('common.all')}
              />
            </div>

            {/* Categories */}
            <div>
              <MultiSelect
                label={t('categories.title')}
                options={categoryNames}
                value={selectedCategoryNames}
                onChange={setSelectedCategoryNames}
                placeholder={t('common.all')}
              />
            </div>

            {/* Cities */}
            <div>
              <MultiSelect
                label={t('nav.cities')}
                options={cityNames}
                value={selectedCityNames}
                onChange={setSelectedCityNames}
                placeholder={t('common.all')}
              />
            </div>

            {/* Occasion type */}
            <div>
              <label className={labelStyle}>{t('salesReport.occasionType')}</label>
              <input
                type="text"
                value={occasionType}
                onChange={(e) => setOccasionType(e.target.value)}
                placeholder="e.g. birthday"
                className={inputClass}
              />
            </div>

            {/* Group by */}
            <div>
              <label className={labelStyle}>{t('salesReport.groupBy')}</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className={inputClass}
              >
                {GROUP_BY_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Gift type toggle */}
            <div>
              <label className={labelStyle}>{t('salesReport.giftType')}</label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                {(['', 'money', 'gift'] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setGiftType(val)}
                    className={`flex-1 py-2 text-sm transition-colors ${
                      giftType === val
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {val === '' ? t('common.all') : t(`packaging.giftTypeOptions.${val}`) || val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <Button type="submit" variant="primary" disabled={isFetching}>
              {isFetching ? t('common.loading') : t('salesReport.applyFilters')}
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset}>
              {t('salesReport.reset')}
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Loading skeleton ── */}
      {isLoading && appliedFilters && <ReportSkeleton />}

      {/* ── Results ── */}
      {report && !isLoading && (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title={t('salesReport.totalRevenue')}
              value={`${report.summary.totalRevenue.toLocaleString()} SAR`}
              icon={DollarSign}
            />
            <StatCard
              title={t('salesReport.totalTransactions')}
              value={report.summary.totalTransactions.toLocaleString()}
              icon={ShoppingCart}
            />
            <StatCard
              title={t('salesReport.avgOrderValue')}
              value={`${report.summary.averageOrderValue.toLocaleString()} SAR`}
              icon={TrendingUp}
            />
            <StatCard
              title={t('salesReport.totalDiscount')}
              value={`${report.summary.totalDiscount.toLocaleString()} SAR`}
              icon={Tag}
            />
            <StatCard
              title={t('salesReport.netRevenue')}
              value={`${report.summary.netRevenue.toLocaleString()} SAR`}
              icon={Minus}
            />
          </div>

          {/* Breakdown Chart */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('salesReport.breakdownChart')}</h2>
              <div className="flex gap-2 flex-wrap">
                {/* Metric toggle */}
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setChartMetric('revenue')}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      chartMetric === 'revenue'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('salesReport.totalRevenue')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('transactions')}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      chartMetric === 'transactions'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('salesReport.totalTransactions')}
                  </button>
                </div>
                {/* Chart type toggle */}
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      chartType === 'bar'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BarChart3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType('line')}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      chartType === 'line'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BarChart2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {report.breakdown.length === 0 ? (
              <p className="text-gray-500 text-center py-12">{t('common.noData')}</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                {chartType === 'bar' ? (
                  <BarChart data={report.breakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) =>
                        chartMetric === 'revenue'
                          ? `${value.toLocaleString()} SAR`
                          : value.toLocaleString()
                      }
                    />
                    <Bar dataKey={chartMetric} fill="#766689" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={report.breakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) =>
                        chartMetric === 'revenue'
                          ? `${value.toLocaleString()} SAR`
                          : value.toLocaleString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey={chartMetric}
                      stroke="#766689"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </Card>

          {/* Top Products & Top Brands */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('salesReport.topProducts')}</h2>
              {report.topProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('common.noData')}</p>
              ) : (
                <div className="space-y-2">
                  {report.topProducts.slice(0, 10).map((p, i) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">{p.name}</span>
                      </div>
                      <div className={`flex flex-col items-end text-xs flex-shrink-0 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                        <span className="font-semibold text-gray-900">{p.revenue.toLocaleString()} SAR</span>
                        <span className="text-gray-500">{p.sales} {t('common.total')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Top Brands */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('salesReport.topBrands')}</h2>
              {report.topBrands.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('common.noData')}</p>
              ) : (
                <div className="space-y-2">
                  {report.topBrands.slice(0, 10).map((b, i) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">{b.name}</span>
                      </div>
                      <div className={`flex flex-col items-end text-xs flex-shrink-0 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                        <span className="font-semibold text-gray-900">{b.revenue.toLocaleString()} SAR</span>
                        <span className="text-gray-500">{b.sales} {t('common.total')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('salesReport.transactions')}</h2>
              <span className="text-sm text-gray-500">
                {report.totalTransactionCount.toLocaleString()} {t('common.total')}
              </span>
            </div>

            {report.transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-12">{t('common.noData')}</p>
            ) : (
              <>
                <Table loading={isFetching}>
                  <Table.Head>
                    <Table.Row>
                      <Table.Th>{t('common.date')}</Table.Th>
                      <Table.Th>{t('occasions.name')}</Table.Th>
                      <Table.Th>{t('payments.name')}</Table.Th>
                      <Table.Th>{t('payments.amount')}</Table.Th>
                      <Table.Th>{t('common.city')}</Table.Th>
                      <Table.Th>{t('salesReport.giftType')}</Table.Th>
                      <Table.Th>{t('brands.title')}</Table.Th>
                      <Table.Th>{t('products.title')}</Table.Th>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {report.transactions.map((tx, idx) => (
                      <Table.Row key={tx.occasionId + idx}>
                        <Table.Td className="text-gray-600">
                          {new Date(tx.date).toLocaleDateString()}
                        </Table.Td>
                        <Table.Td className="font-medium text-gray-900 max-w-[140px] truncate">
                          {tx.occasionName}
                        </Table.Td>
                        <Table.Td className="text-gray-700">{tx.payerName}</Table.Td>
                        <Table.Td className="font-semibold text-gray-900">
                          {tx.amount.toLocaleString()} SAR
                        </Table.Td>
                        <Table.Td className="text-gray-600">{tx.city}</Table.Td>
                        <Table.Td className="text-gray-600 capitalize">{tx.giftType}</Table.Td>
                        <Table.Td className="text-gray-600 max-w-[120px] truncate">{tx.brands}</Table.Td>
                        <Table.Td className="text-gray-600 max-w-[120px] truncate">{tx.products}</Table.Td>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={transPage}
                    totalPages={totalPages}
                    onPageChange={(p) => setTransPage(p)}
                  />
                )}
              </>
            )}
          </Card>
        </>
      )}

      {/* Empty state when no filters applied yet */}
      {!appliedFilters && !isLoading && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Download size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-medium">{t('salesReport.applyFilters')}</p>
          <p className="text-sm mt-1">{t('common.filter')}</p>
        </div>
      )}
    </div>
  );
}
