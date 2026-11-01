import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
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
import { Activity } from 'lucide-react';

export const WeeklyActivityChart = () => {
  const [data, setData] = useState(WEEKLY_ACTIVITY);
  const [isLive, setIsLive] = useState(false);
  const [totalWeeklyScans, setTotalWeeklyScans] = useState('4,752 Weekly Scans');

  useEffect(() => {
    async function loadTrends() {
      try {
        const res = await getTrends('weekly');
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
              scans: item.total_scans,
              recyclable: item.recyclable_scans,
              compostable: item.compostable_scans,
              residual: item.residual_scans,
            };
          });

          setData(formatted);
          setIsLive(true);
          const total = formatted.reduce((acc, curr) => acc + curr.scans, 0);
          setTotalWeeklyScans(`${total} Active Telemetry Logs`);
        }
      } catch (err) {
        console.warn('Could not load live weekly trends:', err);
      }
    }

    loadTrends();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        action={
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isLive ? 'bg-emerald-500 animate-pulse' : 'bg-forest-700'
              }`}
            />
            <span>{totalWeeklyScans}</span>
          </div>
        }
      >
        <CardTitle className="flex items-center gap-2">
          <Activity size={18} className="text-forest-700" />
          Weekly Scanning Activity
        </CardTitle>
        <CardDescription>
          Daily classification throughput across recyclable, compostable, and residual streams
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRecyclable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCompostable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="recyclable"
                name="Recyclable Items"
                stroke="#2563EB"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRecyclable)"
              />
              <Area
                type="monotone"
                dataKey="compostable"
                name="Compostable Items"
                stroke="#16A34A"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCompostable)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyActivityChart;
