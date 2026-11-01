import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Professional Reusable Button Component
 * Supports multiple design system variants, sizes, icon slots, and animated loading states.
 */
export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  // Base styling: rounded corners, smooth transition, professional focus ring
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]';

  const sizeStyles = {
    xs: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5 h-7',
    sm: 'text-xs sm:text-sm px-3 py-1.5 rounded-lg gap-1.5 h-8',
    md: 'text-sm px-4 py-2 rounded-xl gap-2 h-10',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 h-12',
    icon: 'p-2 rounded-xl h-10 w-10 justify-center',
    'icon-sm': 'p-1.5 rounded-lg h-8 w-8 justify-center',
  };

  const variantStyles = {
    primary: 'bg-forest-800 hover:bg-forest-900 active:bg-forest-950 text-white shadow-sm hover:shadow focus-visible:ring-forest-700',
    secondary: 'bg-forest-50 hover:bg-forest-100/90 text-forest-800 border border-forest-200/80 focus-visible:ring-forest-600',
    outline: 'bg-white hover:bg-forest-50/60 text-slate-700 border border-slate-200 hover:border-forest-300 hover:text-forest-900 focus-visible:ring-forest-600 shadow-xs',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-400',
    danger: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 focus-visible:ring-red-500',
    'danger-solid': 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus-visible:ring-red-600 shadow-sm',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus-visible:ring-emerald-600',
  };

  const combinedStyles = [
    baseStyles,
    sizeStyles[size] || sizeStyles.md,
    variantStyles[variant] || variantStyles.primary,
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  const iconSize = size === 'xs' || size === 'sm' || size === 'icon-sm' ? 14 : 16;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={combinedStyles}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin text-current shrink-0" size={iconSize} />
      ) : LeftIcon ? (
        <LeftIcon size={iconSize} className="shrink-0" />
      ) : null}

      {children && <span className="truncate">{children}</span>}

      {!isLoading && RightIcon ? (
        <RightIcon size={iconSize} className="shrink-0" />
      ) : null}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
