export const PROPERTY_STATUS = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SOLD: "SOLD",
};

export const statusTone = (status) => {
  switch (status) {
    case PROPERTY_STATUS.APPROVED:
      return "green";
    case PROPERTY_STATUS.PENDING:
      return "yellow";
    case PROPERTY_STATUS.REJECTED:
      return "red";
    case PROPERTY_STATUS.SOLD:
      return "purple";
    case PROPERTY_STATUS.DRAFT:
      return "gray";
    default:
      return "gray";
  }
};
