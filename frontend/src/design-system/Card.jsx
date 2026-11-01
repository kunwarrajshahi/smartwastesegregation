import React from 'react';

export const Card = React.forwardRef(({
  children,
  className = '',
  hoverEffect = false,
  bordered = true,
  onClick,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`bg-white rounded-2xl ${bordered ? 'border border-slate-200/80' : ''} shadow-card ${
        hoverEffect
          ? 'hover:border-forest-300/80 hover:shadow-card-hover transition-all duration-200 cursor-pointer'
          : 'transition-shadow duration-200'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = ({ children, className = '', action, ...props }) => {
  return (
    <div
      className={`px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between gap-4 ${className}`}
      {...props}
    >
      <div className="space-y-1 min-w-0">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3
      className={`text-base sm:text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-xs sm:text-sm text-slate-500 font-normal leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div className={`${noPadding ? '' : 'p-5 sm:p-6'} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50/60 border-t border-slate-100 rounded-b-2xl flex items-center justify-between text-xs sm:text-sm text-slate-600 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
