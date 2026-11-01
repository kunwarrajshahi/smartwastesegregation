import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import Badge from '../../design-system/Badge';
import { MODEL_CLASS_PERFORMANCE } from '../../data/mockData';
import { WASTE_CATEGORIES, normalizeCategoryKey } from '../../design-system/tokens';
import { Cpu, Award, Zap, CheckCircle2 } from 'lucide-react';

export const ModelPerformanceOverview = ({ modelInfo }) => {
  const accuracyStr = modelInfo?.saved_validation_accuracy
    ? `${modelInfo.saved_validation_accuracy.toFixed(1)}% Accuracy`
    : '74.3% Accuracy';

  const archStr = modelInfo?.model_architecture
    ? `${modelInfo.model_architecture} Fine-Tuned`
    : 'ResNet18 Fine-Tuned';

  const deviceStr = modelInfo?.device
    ? `24ms ${modelInfo.device.toUpperCase()} Inference`
    : '24ms CPU Inference';

  return (
    <Card>
      <CardHeader
        action={
          <div className="flex items-center gap-2">
            <Badge variant="forest" size="sm">
              PyTorch {modelInfo?.model_architecture || 'ResNet18'}
            </Badge>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {accuracyStr}
            </span>
          </div>
        }
      >
        <CardTitle className="flex items-center gap-2">
          <Cpu size={18} className="text-forest-700" />
          Model Performance Overview
        </CardTitle>
        <CardDescription>
          Evaluation benchmarks on 951 held-out test images from the RealWaste dataset
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Spec Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[11px]">Architecture</span>
            <span className="font-bold text-slate-800">{archStr}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[11px]">Training Distribution</span>
            <span className="font-bold text-slate-800">4,752 Images (9 Classes)</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[11px]">Macro Avg Precision</span>
            <span className="font-bold text-slate-800">77.0% Precision</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[11px]">Average Latency</span>
            <span className="font-bold text-slate-800">{deviceStr}</span>
          </div>
        </div>

        {/* Evaluation Metrics Table */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Waste Category</th>
                <th className="px-4 py-3">Precision</th>
                <th className="px-4 py-3">Recall</th>
                <th className="px-4 py-3">F1-Score</th>
                <th className="px-4 py-3">Test Support</th>
                <th className="px-4 py-3 text-right">Purity Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {MODEL_CLASS_PERFORMANCE.map((row) => {
                const catKey = normalizeCategoryKey(row.category);
                const cat = WASTE_CATEGORIES[catKey];
                const precPct = Math.round(row.precision * 100);
                const recPct = Math.round(row.recall * 100);

                return (
                  <tr key={row.category} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2.5 font-semibold text-slate-900 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat?.binColor || '#64748B' }}
                      />
                      <span>{row.category}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">
                      {precPct}%
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">
                      {recPct}%
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">
                      {row.f1.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {row.samples} samples
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          precPct >= 85
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : precPct >= 75
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {precPct >= 85 ? 'High Purity' : precPct >= 75 ? 'Standard' : 'Moderate'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelPerformanceOverview;
