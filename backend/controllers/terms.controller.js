import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";

function getUserIdFromRequest(req) {
  const authHeader = req.headers?.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.id || null;
  } catch {
    return null;
  }
}

export const acceptTerms = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const ip = req.ip;
    const userAgent = req.get("user-agent") || null;

    await prisma.termsAcceptance.create({
      data: {
        userId: userId || null,
        ip,
        userAgent,
      },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("terms accept error:", err);
    return res.status(500).json({ message: err.message || "Failed to record acceptance" });
  }
};
