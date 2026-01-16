import React, { useEffect } from "react";

export default function Modal({
  open,
  title,
  onClose,
  actions,
  children,
  closeOnBackdrop = true,
  closeOnEsc = true,
}) {
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (closeOnBackdrop) onClose?.();
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>

          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>

        {actions ? (
          <div className="px-5 py-4 border-t flex justify-end gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
