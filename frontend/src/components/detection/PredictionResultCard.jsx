import React from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Trash2,
  Leaf,
  Info,
  ShieldCheck,
  Cpu,
  BarChart2,
} from 'lucide-react';
import Button from '../../design-system/Button';
import Badge, { ConfidenceBadge } from '../../design-system/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { WASTE_CATEGORIES, normalizeCategoryKey } from '../../design-system/tokens';

export const PredictionResultCard = ({
  result,
  imageUrl,
  onReset,
}) => {
  if (!result) return null;

  // Exact fields from FastAPI: predicted_class, confidence, confidence_percentage, top_predictions
  const rawClass = result.predicted_class || result.predictedClass || result.category;
  const catKey = normalizeCategoryKey(rawClass);
  const cat = WASTE_CATEGORIES[catKey] || {
    name: rawClass || 'Uncategorized',
    recyclability: 'Review Required',
    recyclabilityType: 'default',
    binName: 'Secondary Inspection Bin',
    binColor: '#64748B',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    disposalGuide: 'Inspect item manual label or municipal sorting matrix.',
    environmentalTip: 'Proper segregation prevents contamination of recyclable batches.',
  };

  const confidenceScore = typeof result.confidence === 'number' ? result.confidence : 0.0;
  const confidencePct = typeof result.confidence_percentage === 'number'
    ? result.confidence_percentage.toFixed(2)
    : (confidenceScore * 100).toFixed(2);

  // Format probabilities: if top_predictions or probabilities is returned by backend
  const candidateList = (
    result.top_predictions ||
    result.probabilities ||
    []
  ).map((p) => ({
    name: p.class || p.category || p.name || 'Unknown',
    score: typeof p.confidence === 'number' ? p.confidence : p.probability || 0,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Predicted Category Header */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-card ${cat.bg} ${cat.border}`}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-white"
            style={{ backgroundColor: cat.binColor }}
          >
            <span className="font-bold text-xl sm:text-2xl uppercase">
              {cat.name.slice(0, 2)}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                FastAPI ResNet18 Prediction
              </span>
              <Badge variant={cat.recyclabilityType} size="xs">
                {cat.recyclability}
              </Badge>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700 font-semibold">
                POST /predict 200 OK
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {cat.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Assigned Bin: <span className="font-bold text-slate-900">{cat.binName}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
          <span className="text-xs text-slate-500 font-medium">Model Confidence</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-forest-900 font-mono">
              {confidencePct}%
            </span>
          </div>
          <ConfidenceBadge score={confidenceScore} size="sm" />
        </div>
      </div>

      {/* Main Grid: Uploaded Image Preview & Class Probability Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Uploaded Image & Target Diagnostic (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm">Classified Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-square flex items-center justify-center border border-slate-200">
                <img
                  src={imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md font-mono">
                  {result.filename || 'waste_image.jpg'}
                </div>
              </div>

              {/* Material metadata */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Class Label</span>
                  <span className="font-semibold text-slate-800">{cat.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Recyclability Status</span>
                  <span className="font-semibold text-slate-800">{cat.recyclability}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Target Resolution</span>
                  <span className="font-mono text-slate-800">224 x 224 px (RGB)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Model Checkpoint</span>
                  <span className="font-mono text-slate-800">models/best_model.pth</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Probability Distribution (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader
              action={
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Cpu size={14} className="text-forest-700" />
                  Softmax Distribution
                </span>
              }
            >
              <CardTitle className="text-sm">Candidate Class Probabilities</CardTitle>
              <CardDescription>
                Predictions returned by the PyTorch ResNet18 classifier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {candidateList.length > 0 ? (
                candidateList.map((item, idx) => {
                  const itemKey = normalizeCategoryKey(item.name);
                  const itemMeta = WASTE_CATEGORIES[itemKey] || {
                    binColor: '#64748B',
                  };
                  const pct = (item.score * 100).toFixed(2);
                  const isTop = idx === 0;

                  return (
                    <div key={item.name || idx} className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: itemMeta.binColor }}
                          />
                          <span className={`font-medium ${isTop ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                            {item.name}
                          </span>
                          {isTop && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                              Top Prediction
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-semibold text-slate-800">
                          {pct}%
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isTop ? 'bg-forest-700' : 'bg-slate-300'
                          }`}
                          style={{ width: `${Math.max(item.score * 100, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-500 py-3 text-center">
                  Top prediction: <span className="font-bold text-slate-800">{cat.name} ({confidencePct}%)</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actionable Disposal Recommendation Card */}
          <Card className="border-forest-200 bg-white">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-forest-900">
                <Leaf size={16} className="text-forest-700" />
                Disposal & Sorting Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-slate-700">
              <div className="p-3 bg-forest-50/70 border border-forest-200/60 rounded-xl space-y-1">
                <span className="font-bold text-forest-900 block">Preparation Instructions:</span>
                <p className="leading-relaxed text-forest-800">
                  {cat.disposalGuide}
                </p>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl space-y-1">
                <span className="font-bold text-blue-900 block">Environmental Impact:</span>
                <p className="leading-relaxed text-blue-800">
                  {cat.environmentalTip}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Sticky Action Bar: Scan Another Image Button */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          Result recorded from <span className="font-semibold text-slate-800">FastAPI POST /predict</span>.
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={RotateCcw}
          onClick={onReset}
          className="w-full sm:w-auto shadow-sm"
        >
          Scan Another Image
        </Button>
      </div>
    </div>
  );
};

export default PredictionResultCard;
