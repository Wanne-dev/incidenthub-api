/**
 * Incident Priority levels
 * LOW: Low priority issues
 * MEDIUM: Medium priority issues
 * HIGH: High priority issues requiring quick attention
 * CRITICAL: Critical issues requiring immediate attention (max 60 min)
 */
export type IncidentPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * Incident Status workflow
 * OPEN → IN_PROGRESS → RESOLVED
 * OPEN → RESOLVED (direct resolution allowed)
 * RESOLVED → OPEN/IN_PROGRESS is NOT allowed (Reto 5)
 */
export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

/**
 * Incident Model - Internal representation of an incident in the system.
 * Contains all fields including server-generated ones (id, status, createdAt).
 */
export interface Incident {
  id: number;
  title: string;
  description: string;
  reporter: string;
  location: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  estimatedMinutes: number;
  createdAt: string;
}
