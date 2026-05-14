import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { AnalyticsItem } from '../../types';
import { formatCurrency } from '../../lib/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-indigo-100 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-indigo-900 mb-1">{label}</p>
        <p className="text-violet-600 font-bold text-sm">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

interface SalesTrendChartProps {
  data: AnalyticsItem[];
  title?: string;
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  data,
  title = 'Sales Trend',
}) => (
  <div className="chart-card">
    <h3 className="chart-title">{title}</h3>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barSize={32}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#818cf8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#818cf8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#eef2ff', radius: 8 }} />
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill="url(#barGradient)" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);
