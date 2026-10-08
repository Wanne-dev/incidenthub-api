import { Incident } from "../models/incident.model";

/**
 * In-memory data store for incidents.
 * 
 * Initial dataset with 5 incidents as required by the project specification:
 * - 1 reference incident from the PDF example
 * - 4 additional incidents designed with varied priorities and statuses
 * 
 * Persistence: In-memory array (no database in v1)
 */
export let incidents: Incident[] = [
  {
    id: 1,
    title: "Proyector sin señal",
    description: "El proyector no reconoce ningún computador conectado.",
    reporter: "Carlos Díaz",
    location: "Aula 201",
    priority: "MEDIUM",
    status: "OPEN",
    estimatedMinutes: 30,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Falla de red",
    description: "Sin internet en el área de diseño.",
    reporter: "Ana Torres",
    location: "Piso 2",
    priority: "HIGH",
    status: "IN_PROGRESS",
    estimatedMinutes: 45,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Impresora atascada",
    description: "Atasco de papel en la impresora principal.",
    reporter: "Luis Pérez",
    location: "Recepción",
    priority: "LOW",
    status: "OPEN",
    estimatedMinutes: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    title: "Servidor caído",
    description: "El servidor de base de datos no responde.",
    reporter: "Admin",
    location: "Data Center",
    priority: "CRITICAL",
    status: "OPEN",
    estimatedMinutes: 60,
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    title: "Teclado dañado",
    description: "Faltan teclas en el equipo 5.",
    reporter: "María Gómez",
    location: "Lab 1",
    priority: "LOW",
    status: "RESOLVED",
    estimatedMinutes: 10,
    createdAt: new Date().toISOString()
  }
];
