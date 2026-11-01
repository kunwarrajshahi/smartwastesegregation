import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import Badge, { ConfidenceBadge } from '../../design-system/Badge';
import Button from '../../design-system/Button';
import { WASTE_CATEGORIES, normalizeCategoryKey } from '../../design-system/tokens';
import { resolveImageUrl, formatTimeAgo } from '../../utils/formatters';
import { History, Eye, ArrowRight, RefreshCw, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const RecentPredictionsList = ({
  predictions = [],
  onSelectScan,
  onViewAllClick,
  isBackendOnline = true,
  onRefreshScans,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    if (onRefreshScans) {
      setIsRefreshing(true);
      try {
        await onRefreshScans();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const displayScans = predictions.slice(0, 5);

  return (
    <Card>
      <CardHeader
        action={
          <div className="flex items-center gap-2">
            {onRefreshScans && (
              <Button
                size="xs"
                variant="outline"
                leftIcon={RefreshCw}
                isLoading={isRefreshing}
                onClick={handleManualRefresh}
                title="Fetch latest scans from database"
              >
                Refresh
              </Button>
            )}
            <Button
              size="xs"
              variant="ghost"
              rightIcon={ArrowRight}
              onClick={onViewAllClick}
            >
              View Full History
            </Button>
          </div>
        }
      >
        <div className="flex items-center gap-2.5">
          <CardTitle className="flex items-center gap-2">
            <History size={18} className="text-forest-700" />
            Recent Prediction History
          </CardTitle>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              isBackendOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isBackendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {isBackendOnline ? `Live Database (${predictions.length} scans)` : 'Offline Telemetry'}
          </span>
        </div>
        <CardDescription>
          Real-time optical segregation stream from municipal sorter conveyor & upload telemetry
        </CardDescription>
      </CardHeader>

      <CardContent noPadding>
        {/* Stream Status Banner */}
        <div className="px-5 py-2.5 bg-forest-50/50 border-b border-forest-100/60 flex flex-wrap items-center justify-between text-xs text-forest-900 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-forest-600 shrink-0" />
            <span className="font-medium text-slate-700">
              Showing top 5 most recent classifications stored in SQLite database
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-forest-700 shrink-0">
            <span>ResNet18 Fine-Tuned</span>
            <span>•</span>
            <span>9 Classes</span>
          </div>
        </div>

        {displayScans.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mx-auto mb-3 border border-forest-100">
              <History size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Scans Recorded Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Run your first image classification in the Waste Detection studio to stream live telemetry here.
            </p>
            {onViewAllClick && (
              <Button
                size="sm"
                variant="primary"
                leftIcon={Sparkles}
                onClick={onViewAllClick}
              >
                Perform First Scan
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">File / Item</th>
                  <th className="px-4 py-3">Predicted Category</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Assigned Bin</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayScans.map((scan) => {
                  const rawCategory = scan.predictedClass || scan.category;
                  const catKey = normalizeCategoryKey(rawCategory);
                  const cat = WASTE_CATEGORIES[catKey] || WASTE_CATEGORIES.miscellaneous_trash;
                  const imgSrc = resolveImageUrl(scan.imageUrl || scan.sampleImage) || cat.sampleImages?.[0];
                  const timeDisplay = formatTimeAgo(scan.timestamp || scan.created_at);

                  return (
                    <tr
                      key={scan.id}
                      onClick={() => onSelectScan && onSelectScan(scan)}
                      className="hover:bg-forest-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-2xs bg-slate-100 flex items-center justify-center">
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={scan.filename || scan.item}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  // Fallback to category color block if image fails to load
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">
                                {cat.name.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-[180px] group-hover:text-forest-900 transition-colors">
                              {scan.filename || scan.item}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {scan.id} {scan.weight_kg ? `• ${scan.weight_kg} kg` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge category={catKey} size="sm" dot>
                          {cat.name}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <ConfidenceBadge score={scan.confidence} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-slate-700 truncate block max-w-[140px]">
                          {scan.destinationBin || cat.binName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {scan.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={11} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-medium" title={scan.timestamp}>
                        {timeDisplay}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          leftIcon={Eye}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectScan && onSelectScan(scan);
                          }}
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentPredictionsList;
