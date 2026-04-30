import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

type MobileModalShellProps = {
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  headerAside?: ReactNode;
  overlayClassName?: string;
  panelClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  closeAriaLabel?: string;
};

export default function MobileModalShell({
  title,
  children,
  onClose,
  description,
  eyebrow,
  icon,
  footer,
  headerAside,
  overlayClassName,
  panelClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  closeAriaLabel = '关闭弹窗',
}: MobileModalShellProps) {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className={clsx(
        'fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-900/35 px-3 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] pt-5 backdrop-blur-sm sm:items-center sm:p-4',
        overlayClassName,
      )}
    >
      <div
        className={clsx(
          'flex w-full max-h-[calc(100dvh-7rem)] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] sm:max-h-[90vh]',
          panelClassName,
        )}
      >
        <div
          className={clsx(
            'flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5 sm:py-5',
            headerClassName,
          )}
        >
          <div className="flex min-w-0 items-start gap-3">
            {icon ? <div className="rounded-2xl bg-blue-50 p-2 text-blue-600 shadow-sm">{icon}</div> : null}
            <div className="min-w-0">
              {eyebrow ? <p className="text-sm font-medium text-blue-600">{eyebrow}</p> : null}
              <h2 className={clsx('text-lg font-semibold text-slate-900', eyebrow ? 'mt-1' : '')}>{title}</h2>
              {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {headerAside}
            <button
              type="button"
              aria-label={closeAriaLabel}
              onClick={onClose}
              className="shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className={clsx('min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5', bodyClassName)}>
          {children}
        </div>

        {footer ? (
          <div className={clsx('shrink-0 border-t border-slate-100 px-4 py-4 sm:px-5 sm:py-5', footerClassName)}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

