import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./Button.jsx";
import { cn } from "../lib/cn.js";

/**
 * Modal built on the native <dialog> element: focus trapping, Esc to close and
 * the inert background come from the browser.
 */
export function Dialog({ open, onClose, title, description, children, footer, size = "md" }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // Click on the backdrop (the dialog element itself, outside the panel) closes it
      onClick={(e) => e.target === ref.current && onClose()}
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-2xl border border-border bg-surface p-0 text-text shadow-pop",
        "backdrop:bg-black/40 backdrop:backdrop-blur-[2px] open:animate-pop-in",
        size === "lg" ? "max-w-2xl" : "max-w-md",
      )}
    >
      {open && (
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1">
              <X className="size-4" />
            </Button>
          </div>
          <div className="overflow-y-auto px-6 pb-5">{children}</div>
          {footer && (
            <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-surface-2/50 px-6 py-4 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

/** Confirmation for destructive actions. `confirmText`, if set, must be typed to enable the button. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  confirmText,
  loading,
}) {
  const [typed, setTyped] = useState("");
  const close = () => {
    setTyped("");
    onClose();
  };
  const blocked = confirmText && typed !== confirmText;

  return (
    <Dialog
      open={open}
      onClose={close}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} disabled={blocked}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {confirmText && (
        <label className="block text-sm text-muted">
          Type <span className="font-semibold text-text">{confirmText}</span> to confirm
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="mt-2 h-10 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-text focus:border-danger focus:outline-none"
            autoComplete="off"
          />
        </label>
      )}
    </Dialog>
  );
}
