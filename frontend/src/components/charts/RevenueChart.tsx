import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Dot
} from 'recharts';
import { AnalyticsItem } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface RevenueChartProps {
  data: AnalyticsItem[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-indigo-100 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-indigo-900 mb-1">{label}</p>
        <p className="text-indigo-600 font-bold text-sm">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, title = 'Revenue Trend' }) => (
  <div className="chart-card">
    <h3 className="chart-title">{title}</h3>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="url(#revenueGradient)"
          strokeWidth={2.5}
          dot={<Dot r={4} fill="#6366f1" strokeWidth={2} stroke="white" />}
          activeDot={{ r: 6, fill: '#6366f1' }}
        />
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </LineChart>
    </ResponsiveContainer>
  </div>
);
