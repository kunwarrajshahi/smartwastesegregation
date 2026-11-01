import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { WEEKLY_ACTIVITY } from '../../data/mockData';
import { getTrends } from '../../services/analyticsService';
import { TrendingUp } from 'lucide-react';

export const DailyScanTrendsChart = ({ timeRange = '7d' }) => {
  const [data, setData] = useState(WEEKLY_ACTIVITY);
  const [isLive, setIsLive] = useState(false);
  const [peakDay, setPeakDay] = useState('Friday (890 scans)');

  useEffect(() => {
    async function loadTrends() {
      const tf = timeRange === '30d' || timeRange === 'All' ? 'monthly' : 'weekly';
      try {
        const res = await getTrends(tf);
        if (Array.isArray(res) && res.length > 0 && res.some((item) => item.total_scans > 0)) {
          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const formatted = res.map((item) => {
            let label = item.date;
            try {
              const dt = new Date(item.date);
              label = daysOfWeek[dt.getDay()] || item.date.slice(5);
            } catch {
              label = item.date;
            }
            return {
              day: label,
              date: item.date,
              scans: item.total_scans,
              recyclable: item.recyclable_scans,
              compostable: item.compostable_scans,
              residual: item.residual_scans,
              weight: item.weight_kg,
            };
          });

          setData(formatted);
          setIsLive(true);

          let maxScanItem = formatted[0];
          formatted.forEach((item) => {
            if (item.scans > (maxScanItem?.scans || 0)) {
              maxScanItem = item;
            }
          });
          if (maxScanItem) {
            setPeakDay(`${maxScanItem.day} (${maxScanItem.scans} scans)`);
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic trends, using benchmark:', err);
      }
    }

    loadTrends();
  }, [timeRange]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        action={
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded border ${
              isLive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            Peak: {peakDay}
          </span>
        }
      >
        <CardTitle className="flex items-center gap-2">
          <TrendingUp size={18} className="text-forest-700" />
          Daily Scanning Activity & Trends
        </CardTitle>
        <CardDescription>
          {isLive
            ? 'Live database telemetry across recyclable, compostable, and residual streams'
            : 'Automated classification volume compared to residual landfill volume'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '0.75rem',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="scans"
                name="Total Scans Classified"
                stroke="#154429"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#154429' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="residual"
                name="Residual Landfill Scans"
                stroke="#64748B"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#64748B' }}
              />
              {isLive && (
                <Line
                  type="monotone"
                  dataKey="recyclable"
                  name="Recycled Stream"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#2563EB' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyScanTrendsChart;
