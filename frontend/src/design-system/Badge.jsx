import React from 'react';
import { WASTE_CATEGORIES, STATUS_TYPES, normalizeCategoryKey } from './tokens';

/**
 * Reusable Status & Category Badges
 * Provides semantic color mapping for all 9 waste segregation classes, operational states, and model confidence scores.
 */
export const Badge = ({
  children,
  variant = 'default',
  category,
  status,
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded gap-1 font-medium',
    sm: 'text-xs px-2 py-0.5 rounded-md gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 rounded-lg gap-2 font-medium',
  };

  let variantClass = 'bg-slate-100 text-slate-700 border border-slate-200/80';
  let dotColor = 'bg-slate-500';

  if (category) {
    const key = normalizeCategoryKey(category);
    const cat = WASTE_CATEGORIES[key];
    if (cat) {
      variantClass = `${cat.bg} ${cat.text} border ${cat.border}`;
      dotColor = cat.dot;
    }
  } else if (status && STATUS_TYPES[status.toLowerCase()]) {
    const st = STATUS_TYPES[status.toLowerCase()];
    variantClass = `${st.bg} ${st.text} border ${st.border}`;
    dotColor = st.dot;
  } else {
    const customVariants = {
      default: 'bg-slate-100 text-slate-700 border border-slate-200',
      forest: 'bg-forest-50 text-forest-800 border border-forest-200',
      success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      warning: 'bg-amber-50 text-amber-800 border border-amber-200',
      danger: 'bg-red-50 text-red-800 border border-red-200',
      info: 'bg-blue-50 text-blue-800 border border-blue-200',
      purple: 'bg-purple-50 text-purple-800 border border-purple-200',
      recyclable: 'bg-blue-50 text-blue-700 border border-blue-200',
      compostable: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      non_recyclable: 'bg-slate-100 text-slate-700 border border-slate-300',
      solidForest: 'bg-forest-800 text-white border-transparent',
      outline: 'bg-transparent text-slate-700 border border-slate-300',
    };
    variantClass = customVariants[variant] || customVariants.default;
  }

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`inline-flex items-center justify-center tracking-tight transition-colors ${
        sizeStyles[size] || sizeStyles.md
      } ${variantClass} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`shrink-0 rounded-full ${dotSizes[size] || dotSizes.md} ${dotColor}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-1 p-0.5 hover:bg-black/10 rounded-full transition-colors text-current"
          aria-label="Remove badge"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor">
            <path d="M9 3L3 9M3 3l6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </span>
  );
};

/**
 * Specialized Model Confidence Badge
 * Formats confidence percentage with adaptive color coding.
 */
export const ConfidenceBadge = ({ score, size = 'sm', className = '' }) => {
  const normalizedScore = score > 1 ? score : Math.round(score * 100);

  let variant = 'success';
  if (normalizedScore >= 85) {
    variant = 'success';
  } else if (normalizedScore >= 70) {
    variant = 'info';
  } else if (normalizedScore >= 50) {
    variant = 'warning';
  } else {
    variant = 'danger';
  }

  return (
    <Badge variant={variant} size={size} dot className={className}>
      {normalizedScore}% Match
    </Badge>
  );
};

export default Badge;
