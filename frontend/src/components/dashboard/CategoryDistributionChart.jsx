import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { CATEGORY_DISTRIBUTION } from '../../data/mockData';
import { getCategoryDistribution } from '../../services/analyticsService';
import { PieChart as PieIcon } from 'lucide-react';

export const CategoryDistributionChart = () => {
  const [data, setData] = useState(CATEGORY_DISTRIBUTION);
  const [isLive, setIsLive] = useState(false);
  const [totalCount, setTotalCount] = useState(4752);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getCategoryDistribution();
        if (Array.isArray(res) && res.length > 0 && res.some((item) => item.count > 0)) {
          const total = res.reduce((acc, curr) => acc + curr.count, 0);
          const formatted = res.map((item) => ({
            name: item.category,
            key: item.category_key,
            value: item.count,
            percentage: item.percentage,
            color: item.bin_color || '#2563EB',
          }));
          setData(formatted);
          setIsLive(true);
          setTotalCount(total);
        }
      } catch (err) {
        console.warn('Could not load live category distribution for dashboard:', err);
      }
    }
    loadCategories();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        action={
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isLive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {isLive ? 'Live DB' : 'RealWaste'}
          </span>
        }
      >
        <CardTitle className="flex items-center gap-2">
          <PieIcon size={18} className="text-forest-700" />
          Waste Category Distribution
        </CardTitle>
        <CardDescription>
          {isLive
            ? 'Distribution across waste streams recorded in system database'
            : 'Distribution across all 9 waste streams in the RealWaste benchmark'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="h-52 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2.5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name, item) => [
                  `${val} items (${item.payload.percentage}%)`,
                  item.payload.name,
                ]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '0.75rem',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-800">{totalCount.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {isLive ? 'DB Scans' : 'Total Images'}
            </span>
          </div>
        </div>

        {/* Legend grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
          {data.map((cat) => (
            <div key={cat.name} className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-slate-600 truncate text-[11px]" title={cat.name}>
                {cat.name}
              </span>
              <span className="font-semibold text-slate-800 text-[11px] ml-auto">
                {cat.percentage}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryDistributionChart;
