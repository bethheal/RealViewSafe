import express from "express";
import { acceptTerms } from "../controllers/terms.controller.js";

const router = express.Router();

/**
 * POST /terms/accept
 * Public endpoint (optional auth header)
 */
router.post("/accept", acceptTerms);

export default router;
