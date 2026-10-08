IncidentHub API
Problema solucionado: API REST para registrar y gestionar incidentes tecnológicos, evitando la pérdida de trazabilidad generada por reportes informales.
Tecnologías: Node.js, Express y TypeScript.
Instalación y Ejecución: npm install y npm run dev.

Documentación de endpoints
GET /api/incidents: Retorna todos los incidentes.
GET /api/incidents/:id: Retorna un incidente por ID.
POST /api/incidents: Crea un incidente (requiere token).
PUT /api/incidents/:id: Actualiza un incidente por ID (requiere token).
PATCH /api/incidents/:id/status: Cambia el estado (OPEN, IN_PROGRESS, RESOLVED).
DELETE /api/incidents/:id: Elimina un incidente (requiere instructor-token).
GET /api/incidents/critical: Incidentes críticos.
GET /api/incidents/pending: Incidentes abiertos o en progreso.
GET /api/incidents/stats: Estadísticas.
Explicación de Middlewares
logger / request-info: Registran y enriquecen la solicitud con datos de tiempo y ruta.
auth / admin: Validan tokens (technician-token / instructor-token) y protegen rutas según permisos.
validate-id / validate-incident / validate-priority / validate-time: Aíslan la lógica de validación de datos para limpiar el controlador.
error / not-found: Capturan excepciones (AppError) y rutas huérfanas, centralizando las respuestas HTTP de error.
DTO vs Model
El Model representa la estructura interna de la entidad (con ID, fecha de creación y estado interno), mientras que el DTO define el contrato estricto de datos que el cliente puede enviar, bloqueando la inyección de campos protegidos que el sistema debe autogenerar.

Reflexión obligatoria
Implementar validaciones, autenticación y manejo de errores mediante middlewares ofrece modularidad y separación de responsabilidades. Al extraer esta lógica transversal de los controladores, el código de negocio queda limpio y centrado exclusivamente en su propósito. Además, permite reutilizar validaciones (como validateId o authenticate) en múltiples rutas sin repetir código, facilitando el mantenimiento y garantizando un manejo unificado de errores y formatos de respuesta.
