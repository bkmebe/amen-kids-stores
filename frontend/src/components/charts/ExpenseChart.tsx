import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ExpenseAnalyticsItem } from '../../types';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-indigo-100 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-indigo-900">{payload[0].name}</p>
        <p className="text-indigo-600 font-bold text-sm">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

interface ExpenseChartProps {
  data: ExpenseAnalyticsItem[];
  title?: string;
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ data, title = 'Expenses by Category' }) => (
  <div className="chart-card">
    <h3 className="chart-title">{title}</h3>
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="amount"
          nameKey="category"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: 11, color: '#4338ca' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);
