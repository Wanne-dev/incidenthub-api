import { Request, Response, NextFunction } from "express";
import { incidents } from "../data/incidents.data";
import { AppError } from "../errors/app-error";
import { CreateIncidentDto } from "../dtos/incident.dto";
import { Incident, IncidentStatus } from "../models/incident.model";

/**
 * GET /api/incidents
 * Returns all incidents with total count.
 * Response: 200 OK
 */
export const getIncidents = (req: Request, res: Response) => {
  res.status(200).json({ ok: true, total: incidents.length, data: incidents });
};

/**
 * GET /api/incidents/:id
 * Returns a single incident by ID.
 * Response: 200 OK | 404 Not Found
 */
export const getIncidentById = (req: Request, res: Response, next: NextFunction) => {
  const incident = incidents.find(i => i.id === parseInt(String(req.params.id)));
  if (!incident) return next(new AppError(404, "Incident not found"));
  res.status(200).json({ ok: true, data: incident });
};

/**
 * POST /api/incidents
 * Creates a new incident from CreateIncidentDto.
 * Server auto-generates: id (auto-increment), status (OPEN), createdAt (now).
 * Response: 201 Created
 */
export const createIncident = (req: Request, res: Response) => {
  const dto: CreateIncidentDto = req.body;
  const newIncident: Incident = {
    ...dto,
    id: incidents.length > 0 ? Math.max(...incidents.map(i => i.id)) + 1 : 1,
    status: "OPEN",
    createdAt: new Date().toISOString()
  };
  incidents.push(newIncident);
  res.status(201).json({ ok: true, data: newIncident });
};

/**
 * PUT /api/incidents/:id
 * Updates an existing incident. Protected fields (id, status, createdAt)
 * cannot be modified through this endpoint.
 * Response: 200 OK | 404 Not Found
 */
export const updateIncident = (req: Request, res: Response, next: NextFunction) => {
  const index = incidents.findIndex(i => i.id === parseInt(String(req.params.id)));
  if (index === -1) return next(new AppError(404, "Incident not found"));
  // Destructure to exclude protected fields from update
  const { id, status, createdAt, ...allowedUpdates } = req.body;
  incidents[index] = { ...incidents[index], ...allowedUpdates };
  res.status(200).json({ ok: true, data: incidents[index] });
};

/**
 * PATCH /api/incidents/:id/status
 * Changes only the status of an incident.
 * 
 * Reto 5 - State transition rules:
 * - Allowed: OPEN → IN_PROGRESS, IN_PROGRESS → RESOLVED, OPEN → RESOLVED
 * - NOT allowed: RESOLVED → OPEN, RESOLVED → IN_PROGRESS
 * 
 * Response: 200 OK | 400 Bad Request | 404 Not Found
 */
export const updateStatus = (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.body;
  const validStatuses: IncidentStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED"];
  if (!validStatuses.includes(status)) {
    return next(new AppError(400, "Invalid status. Use OPEN, IN_PROGRESS or RESOLVED"));
  }

  const incident = incidents.find(i => i.id === parseInt(String(req.params.id)));
  if (!incident) return next(new AppError(404, "Incident not found"));

  // Reto 5: Cannot reopen a resolved incident
  if (incident.status === "RESOLVED" && (status === "OPEN" || status === "IN_PROGRESS")) {
    return next(new AppError(400, "Cannot change status from RESOLVED to OPEN or IN_PROGRESS"));
  }

  incident.status = status;
  res.status(200).json({ ok: true, data: incident });
};
