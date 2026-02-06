import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;

export const expressLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info({
      reqId: req.id,
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: Date.now() - start,
      remoteAddress: req.ip,
    });
  });
  next();
};
