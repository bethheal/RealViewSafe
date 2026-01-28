import dotenv from "dotenv";
dotenv.config();

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
if (!paystackSecretKey) {
  console.warn("PAYSTACK_SECRET_KEY is not set in backend/.env");
}

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

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://realviewsafe.onrender.com",
  "https://realviewfrontend.onrender.com",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS blocked"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(path.resolve(), "uploads"), {
    setHeaders(res, filePath) {
      if (filePath.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      } else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
        res.setHeader("Content-Type", "image/jpeg");
      } else if (filePath.endsWith(".webp")) {
        res.setHeader("Content-Type", "image/webp");
      }

      // ✅ helps Chrome allow cross-origin images
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

      // optional
      res.setHeader("Cache-Control", "public, max-age=0");
    },
  }),
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/terms", termsRoutes);
app.use("/api/payments", paymentsRoutes);

app.get("/", (req, res) => {
  res.send("✅ RealViewEstate API is running");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API healthy" });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Database connection failed", error);
    process.exit(1);
  }
}

startServer();
