import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Button from './Button';

/**
 * Reusable Accessible Modal Component
 * Supports custom sizes, backdrop blur, keyboard ESC dismissal, and animated appearance.
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop = true,
  className = '',
}) => {
  // ESC key handler and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="min-h-full flex items-center justify-center p-4 text-center">
        <div
          className={`relative w-full ${
            sizeClasses[size] || sizeClasses.md
          } bg-white rounded-2xl text-left shadow-modal border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 ${className}`}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          {(title || subtitle) && (
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                {title && (
                  <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 font-normal">
                    {subtitle}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors -mr-1"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable Confirmation / Alert Modal
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  isLoading = false,
}) => {
  const iconConfig = {
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-red-50 text-red-600 border border-red-100',
      confirmVariant: 'danger-solid',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      confirmVariant: 'primary',
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      confirmVariant: 'primary',
    },
  };

  const config = iconConfig[variant] || iconConfig.danger;
  const IconComponent = config.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={config.confirmVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5">
        <div className={`p-2.5 rounded-xl shrink-0 ${config.iconBg}`}>
          <IconComponent size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-semibold text-slate-900">{title}</h4>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
