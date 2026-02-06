import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  logger.error({
    reqId: req.id,
    message: message,
    stack: err.stack,
    route: req.originalUrl || req.url,
  });

  if (res.headersSent) return next(err);

  res.status(status).json({
    error: {
      message: status === 500 ? "Internal server error" : message,
      reqId: req.id,
    },
  });
};
