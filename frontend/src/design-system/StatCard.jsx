import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from './Card';

/**
 * Reusable Stat Card Component
 * Highlights key operational metrics, trends, icons, and comparison baselines.
 */
export const StatCard = ({
  title,
  value,
  unit,
  change,
  changeType = 'increase', // 'increase' | 'decrease' | 'neutral'
  period = 'vs last 7 days',
  icon: Icon,
  variant = 'default', // 'default' | 'forest' | 'highlight'
  progress, // optional 0-100 progress value
  tooltip,
  className = '',
}) => {
  // Determine trend badge styles
  const isPositive = changeType === 'increase';
  const isNegative = changeType === 'decrease';

  const isForest = variant === 'forest';

  return (
    <Card
      hoverEffect
      className={`relative overflow-hidden ${
        isForest
          ? 'bg-gradient-to-br from-forest-800 to-forest-900 text-white border-forest-700'
          : 'bg-white'
      } ${className}`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                isForest ? 'text-forest-200' : 'text-slate-500'
              }`}
            >
              {title}
            </span>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span
                className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                  isForest ? 'text-white' : 'text-slate-900'
                }`}
              >
                {value}
              </span>
              {unit && (
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    isForest ? 'text-forest-300' : 'text-slate-500'
                  }`}
                >
                  {unit}
                </span>
              )}
            </div>
          </div>

          {Icon && (
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isForest
                  ? 'bg-white/10 text-forest-200'
                  : 'bg-forest-50 text-forest-700 border border-forest-100'
              }`}
            >
              <Icon size={22} strokeWidth={2} />
            </div>
          )}
        </div>

        {/* Trend Indicator & Context */}
        <div className="mt-4 pt-3 border-t border-slate-100/60 dark:border-white/10 flex items-center justify-between text-xs">
          {change !== undefined && (
            <div className="flex items-center gap-1.5 font-medium">
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${
                  isForest
                    ? 'bg-white/15 text-white'
                    : isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : isNegative
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isPositive ? (
                  <TrendingUp size={13} className="shrink-0" />
                ) : isNegative ? (
                  <TrendingDown size={13} className="shrink-0" />
                ) : (
                  <Minus size={13} className="shrink-0" />
                )}
                <span>{change}</span>
              </span>
              <span className={isForest ? 'text-forest-300' : 'text-slate-400'}>
                {period}
              </span>
            </div>
          )}

          {tooltip && (
            <span
              className={`ml-auto text-[11px] ${
                isForest ? 'text-forest-300' : 'text-slate-400'
              }`}
            >
              {tooltip}
            </span>
          )}
        </div>

        {/* Optional Progress Bar */}
        {typeof progress === 'number' && (
          <div className="mt-3">
            <div
              className={`w-full h-1.5 rounded-full overflow-hidden ${
                isForest ? 'bg-forest-950/60' : 'bg-slate-100'
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isForest ? 'bg-forest-300' : 'bg-forest-600'
                }`}
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
