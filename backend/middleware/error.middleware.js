import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  if (err?.name === "MulterError") {
    let status = 400;
    let message = err.message || "Upload error";

    if (err.code === "LIMIT_FILE_SIZE") {
      status = 413;
      message = "File too large. Max 50MB per file.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      status = 400;
      message = "Too many files. Max 20 files.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      status = 400;
      message = "Unexpected upload field.";
    }

    logger.error({
      reqId: req.id,
      message: message,
      stack: err.stack,
      route: req.originalUrl || req.url,
    });

    return res.status(status).json({
      error: {
        message,
        reqId: req.id,
      },
    });
  }

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
