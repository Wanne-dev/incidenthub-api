import { Router } from "express";
import {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  updateStatus,
  deleteIncident,
  getCritical,
  getPending,
  getStats
} from "../controllers/incident.controller";
import { validateId } from "../middlewares/validate-id.middleware";
import { validateIncident } from "../middlewares/validate-incident.middleware";
import { validatePriority } from "../middlewares/validate-priority.middleware";
import { validateTime } from "../middlewares/validate-time.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";

const router = Router();

/**
 * Incident Routes
 * 
 * Middleware chain order for each endpoint:
 * 1. authenticate (for protected routes)
 * 2. validateId (for :id routes)
 * 3. validateIncident / validatePriority / validateTime (for POST/PUT)
 * 4. requireAdmin (for admin-only routes)
 * 5. controller function
 * 
 * IMPORTANT: Specific routes (/critical, /pending, /stats) must be defined
 * BEFORE /:id to avoid route collision.
 */

// Retos adicionales - specific routes (before /:id to avoid collision)
router.get("/critical", getCritical);      // Reto 1
router.get("/pending", getPending);        // Reto 2
router.get("/stats", getStats);            // Reto 3

// Basic CRUD endpoints
router.get("/", getIncidents);                                    // GET all
router.get("/:id", validateId, getIncidentById);                  // GET by id
router.post("/", authenticate, validateIncident, validatePriority, validateTime, createIncident);  // POST
router.put("/:id", authenticate, validateId, validateIncident, validatePriority, validateTime, updateIncident);  // PUT
router.patch("/:id/status", authenticate, validateId, updateStatus);  // PATCH status
router.delete("/:id", authenticate, requireAdmin, validateId, deleteIncident);  // DELETE (admin only)

export default router;
