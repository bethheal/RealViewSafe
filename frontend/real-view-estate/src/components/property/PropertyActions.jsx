import React from 'react';

import Button from "../ui/Button";

export default function PropertyActions({
  variant = "agent", // "agent" | "admin" | "buyer"
  onEdit,
  onDelete,
  onMarkSold,
  onReview,
  onSave,
  onWhatsApp,
  disableEdit = false,
  disableDelete = false,
  disableSold = false,
  disableReview = false,
  disableSave = false,
  disableWhatsApp = false,
}) {
  if (variant === "agent") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          disabled={disableEdit}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
          disabled={disableDelete}
        >
          Delete
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onMarkSold}
          disabled={disableSold}
        >
          Mark Sold
        </Button>
      </div>
    );
  }

  if (variant === "admin") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReview}
          disabled={disableReview}
        >
          Review
        </Button>
      </div>
    );
  }

  // buyer
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={onSave} disabled={disableSave}>
        Save
      </Button>
      <Button size="sm" onClick={onWhatsApp} disabled={disableWhatsApp}>
        Chat on WhatsApp
      </Button>
    </div>
  );
}
