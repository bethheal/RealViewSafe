import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

import prisma from "./prisma/client.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import buyerRoutes from "./routes/buyer.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import termsRoutes from "./routes/terms.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import logger, { expressLogger } from "./utils/logger.js";
import { requestIdMiddleware } from "./middleware/requestId.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { validateEnv } from "./utils/env.js";

const app = express();

// validate critical env vars at startup
validateEnv();

/* =========================
   CORS CONFIG (FIXED)
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://realviewsafe.onrender.com",
  "https://realviewfrontend.onrender.com",
  "https://realviewgh.com",
];

const corsOptions = {
  origin(origin, callback) {
    // allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// MUST be first (CORS needs to run before other middlewares that depend on origin)
app.use(cors(corsOptions));

// attach a request id early
app.use(requestIdMiddleware);

// basic security headers
// Allow images/videos to be embedded cross-origin (frontend <-> api domains)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }),
);

// request logging
app.use(expressLogger);

/* =========================
   BODY PARSERS
========================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =========================
   STATIC FILES
========================= */

const uploadsDir = path.join(path.resolve(), "uploads");
const uploadsStaticOptions = {
  setHeaders(res, filePath) {
    const lower = filePath.toLowerCase();
    if (lower.endsWith(".png")) {
      res.setHeader("Content-Type", "image/png");
    } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
      res.setHeader("Content-Type", "image/jpeg");
    } else if (lower.endsWith(".webp")) {
      res.setHeader("Content-Type", "image/webp");
    } else if (lower.endsWith(".gif")) {
      res.setHeader("Content-Type", "image/gif");
    } else if (lower.endsWith(".avif")) {
      res.setHeader("Content-Type", "image/avif");
    } else if (lower.endsWith(".mp4")) {
      res.setHeader("Content-Type", "video/mp4");
    } else if (lower.endsWith(".webm")) {
      res.setHeader("Content-Type", "video/webm");
    } else if (lower.endsWith(".mov")) {
      res.setHeader("Content-Type", "video/quicktime");
    } else if (lower.endsWith(".mkv")) {
      res.setHeader("Content-Type", "video/x-matroska");
    } else if (lower.endsWith(".avi")) {
      res.setHeader("Content-Type", "video/x-msvideo");
    } else if (lower.endsWith(".m4v")) {
      res.setHeader("Content-Type", "video/x-m4v");
    }

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cache-Control", "public, max-age=3600");
  },
};

app.use("/uploads", express.static(uploadsDir, uploadsStaticOptions));
app.use("/api/uploads", express.static(uploadsDir, uploadsStaticOptions));

/* =========================
   ROUTES
========================= */

app.use("/api/auth", authRoutes);
// rate limit auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many auth attempts; please try again later.",
});
app.use("/api/auth", authLimiter);
// rate limit payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many payment requests; please try again later.",
});
app.use("/api/payments", paymentLimiter);
app.use("/api/agent", agentRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/terms", termsRoutes);
app.use("/api/payments", paymentsRoutes);

// central error handler (should be last middleware)
app.use(errorHandler);

/* =========================
   HEALTH CHECKS
========================= */

app.get("/", (req, res) => {
  res.send("✅ RealViewEstate API is running");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API healthy" });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`),
    );
  } catch (error) {
    console.error("❌ Database connection failed", error);
    process.exit(1);
  }
}

startServer();

