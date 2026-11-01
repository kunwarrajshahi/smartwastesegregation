import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { CATEGORY_DISTRIBUTION } from '../../data/mockData';
import { getCategoryDistribution } from '../../services/analyticsService';
import { BarChart3 } from 'lucide-react';

export const CategoryVolumeBarChart = () => {
  const [data, setData] = useState(CATEGORY_DISTRIBUTION);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getCategoryDistribution();
        if (Array.isArray(res) && res.length > 0 && res.some((item) => item.count > 0)) {
          const formatted = res.map((item) => ({
            name: item.category,
            key: item.category_key,
            value: item.count,
            weight: item.weight_kg,
            percentage: item.percentage,
            color: item.bin_color || '#2563EB',
          }));
          setData(formatted);
          setIsLive(true);
        }
      } catch (err) {
        console.warn('Could not load live category distribution:', err);
      }
    }
    loadCategories();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        action={
          <span
            className={`text-xs font-mono px-2 py-0.5 rounded border ${
              isLive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {isLive ? 'Live Database Stream' : 'RealWaste Benchmark'}
          </span>
        }
      >
        <CardTitle className="flex items-center gap-2">
          <BarChart3 size={18} className="text-forest-700" />
          Category-Wise Volume Distribution
        </CardTitle>
        <CardDescription>
          {isLive
            ? 'Persistent database image count across all 9 waste classifications'
            : 'Dataset image count per category across all 9 waste classifications'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748B', fontSize: 11 }}
                angle={-25}
                textAnchor="end"
                interval={0}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(val, name, item) => [
                  `${val} images ${item.payload.weight ? `(${item.payload.weight} kg)` : ''}`,
                  item.payload.name,
                ]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '0.75rem',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryVolumeBarChart;
