/**
 * URL routes for the Express application
 */

import { Router } from "express";
import { UrlController } from "../controllers/urlController";

const router = Router();
const urlController = new UrlController();

// Create short URL
// POST /shorturls
router.post("/shorturls", (req, res) => urlController.createShortUrl(req, res));

// Get statistics for a shortcode
// GET /shorturls/:shortcode
router.get("/shorturls/:shortcode", (req, res) =>
  urlController.getStatistics(req, res)
);

// Health check
// GET /health
router.get("/health", (req, res) => urlController.healthCheck(req, res));

// POST /log - Receive logs from frontend
router.post("/log", (req, res) => urlController.logFromFrontend(req, res));

export default router;
