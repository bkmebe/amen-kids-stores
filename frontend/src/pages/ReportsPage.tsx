import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Receipt, Package, Calendar } from 'lucide-react';
import { reportsApi } from '../api/reports.api';
import { RevenueChart } from '../components/charts/RevenueChart';
import { SalesTrendChart } from '../components/charts/SalesTrendChart';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { formatCurrency, formatDate, getStockStatus } from '../lib/utils';

type Period = 'daily' | 'weekly' | 'monthly';
type PLPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

export const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('monthly');
  const [plPeriod, setPlPeriod] = useState<PLPeriod>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getReportFn = { daily: reportsApi.getDaily, weekly: reportsApi.getWeekly, monthly: reportsApi.getMonthly }[period];

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['reports', period],
    queryFn: getReportFn,
  });

  const { data: analytics } = useQuery({
    queryKey: ['sales-analytics', 'daily'],
    queryFn: () => reportsApi.getSalesAnalytics('daily'),
  });

  const { data: monthlyAnalytics } = useQuery({
    queryKey: ['sales-analytics', 'monthly'],
    queryFn: () => reportsApi.getSalesAnalytics('monthly'),
  });

  const plParams = plPeriod === 'custom'
    ? { startDate: startDate || undefined, endDate: endDate || undefined }
    : {};

  const { data: pl, isLoading: plLoading, refetch: refetchPL } = useQuery({
    queryKey: ['profit-loss', plPeriod, startDate, endDate],
    queryFn: () => reportsApi.getProfitLoss(plParams.startDate, plParams.endDate),
  });

  if (reportLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{t('reports')}</h1>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 bg-white border border-indigo-100 rounded-xl p-1 w-fit">
        {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === p
                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm'
                : 'text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            {t(p)}
          </button>
        ))}
      </div>

      {/* Report summary cards */}
      {report && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t('totalRevenue'), value: report.totalSales, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { label: t('totalExpenses'), value: report.totalExpenses, icon: Receipt, color: 'text-rose-600', bg: 'bg-rose-100' },
            { label: 'Product Cost', value: report.totalProductCost, icon: Package, color: 'text-amber-600', bg: 'bg-amber-100' },
            { label: t('netProfit'), value: report.netProfit, icon: BarChart3, color: report.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', bg: report.netProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">{stat.label}</p>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
              </div>
              <p className={`text-xl font-bold mt-2 ${stat.label === t('netProfit') && stat.value < 0 ? 'text-red-600' : 'text-indigo-950'}`}>
                {formatCurrency(stat.value)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={analytics || []} title="Daily Revenue (Last 7 Days)" />
        <SalesTrendChart data={monthlyAnalytics || []} title="Monthly Sales" />
      </div>

      {/* Best sellers */}
      {(report?.bestSellingProducts?.length || 0) > 0 && (
        <div className="card">
          <h3 className="chart-title">{t('bestSellers')}</h3>
          <div className="space-y-3">
            {report!.bestSellingProducts.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-indigo-900 truncate">{item.productName}</p>
                    <span className="text-xs font-semibold text-indigo-600 ml-2">{item.quantitySold} sold</span>
                  </div>
                  <div className="w-full bg-indigo-100 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (item.quantitySold / (report!.bestSellingProducts[0]?.quantitySold || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profit & Loss */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="chart-title mb-0">{t('profitLoss')}</h3>
          <div className="flex flex-wrap gap-2">
            {(['daily', 'weekly', 'monthly', 'custom'] as PLPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  plPeriod === p
                    ? 'bg-indigo-600 text-white'
                    : 'text-indigo-400 hover:bg-indigo-50 border border-indigo-100'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {plPeriod === 'custom' && (
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="form-group">
              <label className="label">{t('startDate')}</label>
              <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">{t('endDate')}</label>
              <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button size="sm" onClick={() => refetchPL()}>{t('generate')}</Button>
            </div>
          </div>
        )}

        {plLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : pl && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: t('revenue'), value: pl.revenue, color: 'text-emerald-600' },
              { label: 'Product Cost', value: -pl.productCosts, color: 'text-amber-600' },
              { label: t('expenses_title'), value: -pl.expenses, color: 'text-rose-600' },
              { label: t('grossProfit'), value: pl.grossProfit, color: pl.grossProfit >= 0 ? 'text-emerald-700' : 'text-red-600' },
              { label: t('netProfit'), value: pl.netProfit, color: pl.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <p className="text-xs text-indigo-400 font-medium uppercase tracking-wide mb-1">{item.label}</p>
                <p className={`text-lg font-bold ${item.color}`}>
                  {item.value >= 0 ? '' : '-'}{formatCurrency(Math.abs(item.value))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low stock */}
      {(report?.lowStockProducts?.length || 0) > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} className="text-amber-500" />
            <h3 className="chart-title mb-0">{t('lowStockItems')}</h3>
            <Badge variant="warning">{report?.lowStockProducts.length}</Badge>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('name')}</th>
                  <th>{t('category')}</th>
                  <th>{t('quantity')}</th>
                  <th>{t('threshold')}</th>
                  <th>{t('stockStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {report!.lowStockProducts.map((p) => {
                  const status = getStockStatus(p.quantity, p.low_stock_threshold);
                  return (
                    <tr key={p.id}>
                      <td className="font-medium text-indigo-900">{p.name}</td>
                      <td><Badge variant="primary">{p.category}</Badge></td>
                      <td className="font-bold text-amber-600">{p.quantity}</td>
                      <td className="text-indigo-400">{p.low_stock_threshold}</td>
                      <td>
                        <Badge variant={status === 'out' ? 'danger' : 'warning'} dot>
                          {status === 'out' ? t('outOfStock') : t('lowStock')}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
