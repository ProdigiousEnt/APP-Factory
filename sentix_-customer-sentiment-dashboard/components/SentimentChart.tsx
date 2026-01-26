
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { Review } from '../types';

interface SentimentChartProps {
  reviews: Review[];
}

const SentimentChart: React.FC<SentimentChartProps> = ({ reviews }) => {
  // Aggregate sentiment by date
  const dataMap: Record<string, { total: number; count: number }> = {};
  reviews.forEach(r => {
    if (!dataMap[r.date]) dataMap[r.date] = { total: 0, count: 0 };
    dataMap[r.date].total += r.sentiment;
    dataMap[r.date].count += 1;
  });

  const chartData = Object.entries(dataMap)
    .map(([date, vals]) => ({
      date,
      sentiment: Number((vals.total / vals.count).toFixed(2))
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">Sentiment Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            domain={[-1, 1]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
          <Area 
            type="monotone" 
            dataKey="sentiment" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorSentiment)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentChart;
