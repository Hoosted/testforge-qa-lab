import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { X } from 'lucide-react';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error';
}

interface ToastInput {
  title: string;
  description?: string;
  variant?: 'success' | 'error';
}

interface ToastContextValue {
  pushToast: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const pushToast = useCallback(
    ({ title, description, variant = 'success' }: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [
        ...current,
        {
          id,
          title,
          variant,
          ...(description ? { description } : {}),
        },
      ]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 4200);
    },
    [dismissToast],
  );

  const value = useMemo<ToastContextValue>(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <aside
        className="toast-stack"
        aria-live="polite"
        aria-atomic="true"
        data-testid="toast-stack"
      >
        {toasts.map((toast) => (
          <article
            key={toast.id}
            className={`toast toast-${toast.variant}`}
            data-testid={`toast-${toast.variant}`}
          >
            <div>
              <strong>{toast.title}</strong>
              {toast.description ? <p>{toast.description}</p> : null}
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismissToast(toast.id)}
              aria-label="Fechar notificacao"
            >
              <X size={16} />
            </button>
          </article>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
