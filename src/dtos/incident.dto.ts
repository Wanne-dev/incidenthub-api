import { IncidentPriority } from "../models/incident.model";

/**
 * CreateIncidentDto - Data Transfer Object for creating a new incident.
 * 
 * The client sends only these fields. The server automatically generates:
 * - id: auto-incremented number
 * - status: always starts as "OPEN"
 * - createdAt: current ISO timestamp
 * 
 * This separation prevents clients from injecting protected fields.
 */
export interface CreateIncidentDto {
  title: string;
  description: string;
  reporter: string;
  location: string;
  priority: IncidentPriority;
  estimatedMinutes: number;
}
