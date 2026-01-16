import React from "react";
import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmModal({
  open,
  title,
  desc,
  confirmText = "Yes",
  cancelText = "No",
  tone = "primary",
  loading = false,
  onClose,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={() => {
        if (!loading) onClose?.();
      }}
      // IMPORTANT: stop click-outside canceling
      closeOnBackdrop={false}
      closeOnEsc={!loading}
      actions={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" disabled={loading} onClick={onClose}>
            {cancelText}
          </Button>

          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-gray-700">{desc}</p>
    </Modal>
  );
}
