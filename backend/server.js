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

app.use(cors());
app.use(express.json());

// ✅ Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

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
