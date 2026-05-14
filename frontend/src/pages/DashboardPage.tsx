import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Package, TrendingUp, Receipt, AlertTriangle,
  DollarSign, BarChart2, ShoppingBag, ArrowUpRight
} from 'lucide-react';
import { reportsApi } from '../api/reports.api';
import { salesApi } from '../api/sales.api';
import { RevenueChart } from '../components/charts/RevenueChart';
import { ExpenseChart } from '../components/charts/ExpenseChart';
import { SalesTrendChart } from '../components/charts/SalesTrendChart';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { formatCurrency, formatDateTime, getStockStatus } from '../lib/utils';
import { DashboardSummary } from '../types';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const }
  }),
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  change?: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor, change, index }) => (
  <motion.div
    className="stat-card"
    custom={index}
    initial="hidden"
    animate="visible"
    variants={cardVariants}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-indigo-950 mt-1">{value}</p>
        {change && (
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight size={12} className="text-emerald-500" />
            <span className="text-xs text-emerald-500 font-medium">{change}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon size={20} className={color} />
      </div>
    </div>
  </motion.div>
);

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportsApi.getDashboardSummary,
    staleTime: 2 * 60 * 1000,
  });

  const { data: todaySales } = useQuery({
    queryKey: ['sales-today'],
    queryFn: salesApi.getTodaySummary,
  });

  const { data: salesAnalytics } = useQuery({
    queryKey: ['sales-analytics', 'weekly'],
    queryFn: () => reportsApi.getSalesAnalytics('weekly'),
  });

  const { data: monthlyAnalytics } = useQuery({
    queryKey: ['sales-analytics', 'monthly'],
    queryFn: () => reportsApi.getSalesAnalytics('monthly'),
  });

  const { data: expenseAnalytics } = useQuery({
    queryKey: ['expense-analytics'],
    queryFn: reportsApi.getExpenseAnalytics,
  });

  const { data: monthlyReport } = useQuery({
    queryKey: ['reports', 'monthly'],
    queryFn: reportsApi.getMonthly,
  });

  if (summaryLoading) return <PageSpinner />;

  const s = summary as DashboardSummary;

  const stats = [
    {
      title: t('totalProducts'),
      value: String(s?.totalProducts || 0),
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: t('inventoryValue'),
      value: formatCurrency(s?.totalInventoryValue || 0),
      icon: DollarSign,
      color: 'text-violet-600',
      bgColor: 'bg-violet-100',
    },
    {
      title: t('todaySales'),
      value: formatCurrency(s?.todaySales || 0),
      icon: ShoppingBag,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: t('monthlySales'),
      value: formatCurrency(s?.monthlySales || 0),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: t('monthlyExpenses'),
      value: formatCurrency(s?.monthlyExpenses || 0),
      icon: Receipt,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
    },
    {
      title: t('monthlyProfit'),
      value: formatCurrency(s?.monthlyProfit || 0),
      icon: BarChart2,
      color: (s?.monthlyProfit || 0) >= 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: (s?.monthlyProfit || 0) >= 0 ? 'bg-emerald-100' : 'bg-red-100',
    },
    {
      title: t('lowStockCount'),
      value: String(s?.lowStockCount || 0),
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: t('transactions'),
      value: String(todaySales?.totalTransactions || 0),
      icon: ShoppingBag,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart
          data={salesAnalytics || []}
          title="Weekly Revenue"
        />
        <SalesTrendChart
          data={monthlyAnalytics || []}
          title="Monthly Sales"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense breakdown */}
        <div className="lg:col-span-1">
          {(expenseAnalytics?.length || 0) > 0 ? (
            <ExpenseChart data={expenseAnalytics || []} />
          ) : (
            <div className="chart-card flex items-center justify-center h-[280px]">
              <div className="empty-state">
                <Receipt size={32} className="text-indigo-200" />
                <p className="text-sm text-indigo-300">No expense data yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Best sellers */}
        <div className="lg:col-span-2 chart-card">
          <h3 className="chart-title">{t('bestSellers')}</h3>
          {monthlyReport?.bestSellingProducts?.length ? (
            <div className="space-y-3">
              {monthlyReport.bestSellingProducts.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-indigo-900 truncate">{item.productName}</p>
                      <span className="text-xs font-semibold text-indigo-600">{item.quantitySold} sold</span>
                    </div>
                    <div className="w-full bg-indigo-100 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (item.quantitySold / (monthlyReport.bestSellingProducts[0]?.quantitySold || 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Package size={32} className="text-indigo-200" />
              <p className="text-sm">No sales data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Low stock alerts */}
      {(monthlyReport?.lowStockProducts?.length || 0) > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-semibold text-indigo-900">{t('lowStockItems')}</h3>
            <Badge variant="warning">{monthlyReport?.lowStockProducts.length}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthlyReport?.lowStockProducts.slice(0, 6).map((product) => {
              const status = getStockStatus(product.quantity, product.low_stock_threshold);
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Package size={16} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-900 truncate">{product.name}</p>
                    <p className="text-xs text-amber-600">{product.quantity} left</p>
                  </div>
                  <Badge variant={status === 'out' ? 'danger' : 'warning'} dot>
                    {status === 'out' ? t('outOfStock') : t('lowStock')}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
