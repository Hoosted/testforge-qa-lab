import type { PropsWithChildren } from 'react';

interface ConfirmModalProps extends PropsWithChildren {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isBusy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isBusy = false,
  onCancel,
  onConfirm,
  children,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        data-testid="confirm-modal"
      >
        <p className="eyebrow">Confirmation required</p>
        <h2 id="confirm-modal-title">{title}</h2>
        <p className="muted">{description}</p>
        {children}
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onCancel} disabled={isBusy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="danger-button"
            onClick={onConfirm}
            disabled={isBusy}
            data-testid="confirm-modal-submit"
          >
            {isBusy ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
