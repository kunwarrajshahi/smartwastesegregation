import React from 'react';
import Card from './Card';

/**
 * Reusable Loading Skeleton Primitives and Patterns
 */
export const Skeleton = ({
  className = '',
  variant = 'rounded', // 'rounded' | 'circular' | 'rectangular'
  width,
  height,
  ...props
}) => {
  const variantStyles = {
    rounded: 'rounded-xl',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`bg-slate-200/70 animate-pulse ${variantStyles[variant] || variantStyles.rounded} ${className}`}
      style={style}
      {...props}
    />
  );
};

/**
 * Skeleton placeholder for Stat Cards
 */
export const StatCardSkeleton = () => {
  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-7 w-32 rounded-lg" />
        <Skeleton className="h-3 w-40 rounded-md" />
      </div>
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md" />
      </div>
    </Card>
  );
};

/**
 * Skeleton placeholder for Data Tables
 */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <Card className="overflow-hidden">
      {/* Top search skeleton */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>

      {/* Table header skeleton */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded-md" />
        ))}
      </div>

      {/* Table rows skeleton */}
      <div className="divide-y divide-slate-100 p-2">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-3 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                className="h-4 flex-1 rounded-md"
                style={{ opacity: 1 - rIdx * 0.12 }}
              />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};

/**
 * Skeleton placeholder for Recharts Visualizations
 */
export const ChartSkeleton = ({ height = 280 }) => {
  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-3 w-48 rounded-md" />
        </div>
        <Skeleton className="h-7 w-24 rounded-lg" />
      </div>

      <div
        className="w-full bg-slate-50/80 rounded-xl flex items-end justify-between p-4 gap-2"
        style={{ height }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const heights = [40, 75, 55, 90, 65, 80, 45, 95];
          return (
            <div
              key={i}
              className="flex-1 bg-slate-200/80 rounded-t-lg animate-pulse"
              style={{ height: `${heights[i % heights.length]}%` }}
            />
          );
        })}
      </div>
    </Card>
  );
};

export default Skeleton;
