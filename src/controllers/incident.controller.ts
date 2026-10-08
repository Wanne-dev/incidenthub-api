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
