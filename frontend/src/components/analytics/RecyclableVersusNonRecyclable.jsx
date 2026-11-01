import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import Badge from '../../design-system/Badge';
import { RECYCLABILITY_SUMMARY } from '../../data/mockData';
import { getOverview } from '../../services/analyticsService';
import { Recycle, Leaf, Trash2, Database, BarChart2 } from 'lucide-react';

export const RecyclableVersusNonRecyclable = () => {
  const [overview, setOverview] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchLiveOverview() {
      try {
        const data = await getOverview();
        if (data && data.total_scans > 0) {
          setOverview(data);
          setIsLive(true);
        }
      } catch (err) {
        console.warn('Could not fetch overview for recyclability card:', err);
      }
    }
    fetchLiveOverview();
  }, []);

  const total = overview?.total_scans || 0;
  const recyclableCount = overview?.recyclable_scans_count || 0;
  const compostableCount = overview?.compostable_scans_count || 0;
  const residualCount = overview?.residual_scans_count || 0;

  const recyclablePct = isLive && total > 0 ? ((recyclableCount / total) * 100).toFixed(1) : '65.0';
  const compostablePct = isLive && total > 0 ? ((compostableCount / total) * 100).toFixed(1) : '17.8';
  const residualPct = isLive && total > 0 ? ((residualCount / total) * 100).toFixed(1) : '17.2';

  const cardsData = isLive
    ? [
        {
          name: 'Recyclable Streams',
          value: Number(recyclablePct),
          count: recyclableCount,
          subtext: 'Plastic, Metal, Paper, Cardboard, Glass',
          icon: Recycle,
          color: '#2563EB',
          textClass: 'text-blue-700',
        },
        {
          name: 'Organic Compostable',
          value: Number(compostablePct),
          count: compostableCount,
          subtext: 'Food Organics, Vegetation',
          icon: Leaf,
          color: '#16A34A',
          textClass: 'text-emerald-700',
        },
        {
          name: 'Residual / Special',
          value: Number(residualPct),
          count: residualCount,
          subtext: 'Misc Trash, Textile Wastes',
          icon: Trash2,
          color: '#64748B',
          textClass: 'text-slate-600',
        },
      ]
    : [
        {
          ...RECYCLABILITY_SUMMARY[0],
          icon: Recycle,
          textClass: 'text-blue-700',
        },
        {
          ...RECYCLABILITY_SUMMARY[1],
          icon: Leaf,
          textClass: 'text-emerald-700',
        },
        {
          ...RECYCLABILITY_SUMMARY[2],
          icon: Trash2,
          textClass: 'text-slate-600',
        },
      ];

  return (
    <Card>
      <CardHeader
        action={
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isLive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}
              />
              {isLive ? `Live Telemetry (${total} DB scans)` : 'RealWaste Benchmark'}
            </span>
          </div>
        }
      >
        <CardTitle className="flex items-center gap-2">
          <Recycle size={18} className="text-forest-700" />
          Recyclable vs Compostable vs Non-Recyclable Distribution
        </CardTitle>
        <CardDescription>
          Macro-stream diversion balance for circular economy processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Horizontal Stacked Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${recyclablePct}%` }}
              title={`Recyclable: ${recyclablePct}%`}
            />
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${compostablePct}%` }}
              title={`Compostable: ${compostablePct}%`}
            />
            <div
              className="h-full bg-slate-500 transition-all duration-500"
              style={{ width: `${residualPct}%` }}
              title={`Residual/Landfill: ${residualPct}%`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Recyclable: {recyclablePct}%
            </span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Compostable: {compostablePct}%
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Residual: {residualPct}%
            </span>
          </div>
        </div>

        {/* 3 Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {cardsData.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    <Icon size={16} />
                  </div>
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    {item.value}%
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.count} items ({item.subtext})
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecyclableVersusNonRecyclable;
