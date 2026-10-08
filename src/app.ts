import express from "express";
import incidentRoutes from "./routes/incident.routes";
import { logger } from "./middlewares/logger.middleware";
import { requestInfo } from "./middlewares/request-info.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { notFound } from "./middlewares/not-found.middleware";

/**
 * Express Application Configuration
 * 
 * Middleware order (as specified in project requirements):
 * 1. express.json() - Parse JSON request bodies
 * 2. logger - Log every request
 * 3. requestInfo - Enrich request with metadata
 * 4. /api/incidents - Mount incident routes
 * 5. notFound - Catch undefined routes (404)
 * 6. errorHandler - Centralized error handling (must be LAST)
 */
const app = express();

// Body parsing middleware
app.use(express.json());

// Global middlewares (applied to all requests)
app.use(logger);
app.use(requestInfo);

// API routes
app.use("/api/incidents", incidentRoutes);

// 404 handler for undefined routes
app.use(notFound);

// Centralized error handler (must be registered last)
app.use(errorHandler);

export default app;
