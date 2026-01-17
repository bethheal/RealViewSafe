import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

import prisma from "./prisma/client.js";

import authRoutes from "./routes/auth.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";

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
  })
);

app.use(express.json());

// static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

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

    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error("❌ Database connection failed", error);
    process.exit(1);
  }
}

startServer();
