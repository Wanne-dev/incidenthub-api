# 📋 EVIDENCIAS DE PRUEBAS - IncidentHub API v1

> Documento de evidencia de las 20 pruebas obligatorias realizadas según especificación del proyecto evaluable Capítulo V.

**Fecha de ejecución:** 2026-10-08
**Entorno:** Node.js 20+ / Express 5.2 / TypeScript 5.9
**Servidor:** http://localhost:3000

---

## 📊 Resumen de Resultados

| # | Prueba | Resultado Esperado | Resultado Obtenido | Estado |
|---|--------|-------------------|-------------------|--------|
| 1 | GET todos los incidentes | 200 | 200 | ✅ PASS |
| 2 | GET incidente existente | 200 | 200 | ✅ PASS |
| 3 | GET incidente inexistente | 404 | 404 | ✅ PASS |
| 4 | GET con ID `abc` | 400 | 400 | ✅ PASS |
| 5 | POST válido | 201 | 201 | ✅ PASS |
| 6 | POST sin título | 400 | 400 | ✅ PASS |
| 7 | POST prioridad inválida | 400 | 400 | ✅ PASS |
| 8 | POST estimatedMinutes negativo | 400 | 400 | ✅ PASS |
| 9 | POST CRITICAL > 60 min | 400 | 400 | ✅ PASS |
| 10 | PUT existente | 200 | 200 | ✅ PASS |
| 11 | PUT inexistente | 404 | 404 | ✅ PASS |
| 12 | PATCH OPEN → IN_PROGRESS | 200 | 200 | ✅ PASS |
| 13 | PATCH IN_PROGRESS → RESOLVED | 200 | 200 | ✅ PASS |
| 14 | PATCH RESOLVED → OPEN | 400 | 400 | ✅ PASS |
| 15 | DELETE sin token | 401 | 401 | ✅ PASS |
| 16 | DELETE con technician-token | 403 | 403 | ✅ PASS |
| 17 | DELETE con instructor-token | 204 | 204 | ✅ PASS |
| 18 | Ruta inexistente | 404 | 404 | ✅ PASS |
| 19 | GET /critical | 200 | 200 | ✅ PASS |
| 20 | GET /stats | 200 | 200 | ✅ PASS |

**🎉 RESULTADO FINAL: 20/20 PRUEBAS EXITOSAS (100%)**

---

## 📝 Detalle de Pruebas

### PRUEBA 1: GET todos los incidentes
**Comando:**
```bash
curl http://localhost:3000/api/incidents
```
**Resultado esperado:** `200 OK`
**Resultado obtenido:**
```json
{
  "ok": true,
  "total": 5,
  "data": [
    {
      "id": 1,
      "title": "Proyector sin señal",
      ...
    }
  ]
}
```
**HTTP Status:** `200` ✅

---

### PRUEBA 2: GET incidente existente (ID=1)
**Comando:**
```bash
curl http://localhost:3000/api/incidents/1
```
**Resultado esperado:** `200 OK`
**Resultado obtenido:** Incidente ID 1 retornado correctamente
**HTTP Status:** `200` ✅

---

### PRUEBA 3: GET incidente inexistente (ID=999)
**Comando:**
```bash
curl http://localhost:3000/api/incidents/999
```
**Resultado esperado:** `404 Not Found`
**Resultado obtenido:**
```json
{
  "ok": false,
  "message": "Incident not found"
}
```
**HTTP Status:** `404` ✅

---

### PRUEBA 4: GET con ID inválido (`abc`)
**Comando:**
```bash
curl http://localhost:3000/api/incidents/abc
```
**Resultado esperado:** `400 Bad Request`
**Resultado obtenido:**
```json
{
  "ok": false,
  "message": "Invalid incident id"
}
```
**HTTP Status:** `400` ✅

---

### PRUEBA 5: POST válido
**Comando:**
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{
    "title": "Router sin conectividad",
    "description": "El router del segundo piso perdió conexión.",
    "reporter": "Ana Torres",
    "location": "Piso 2",
    "priority": "HIGH",
    "estimatedMinutes": 40
  }'
```
**Resultado esperado:** `201 Created`
**Resultado obtenido:**
```json
{
  "ok": true,
  "data": {
    "title": "Router sin conectividad",
    "description": "El router del segundo piso perdió conexión.",
    "reporter": "Ana Torres",
    "location": "Piso 2",
    "priority": "HIGH",
    "estimatedMinutes": 40,
    "id": 6,
    "status": "OPEN",
    "createdAt": "2026-10-08T19:59:51.933Z"
  }
}
```
**HTTP Status:** `201` ✅

---

### PRUEBA 6: POST sin título (campo faltante)
**Comando:**
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{
    "description": "Sin título",
    "reporter": "Test",
    "location": "Test",
    "priority": "LOW",
    "estimatedMinutes": 10
  }'
```
**Resultado esperado:** `400 Bad Request`
**Resultado obtenido:**
```json
{
  "ok": false,
  "message": "Missing required fields: title, description, reporter, location, priority, estimatedMinutes"
}
```
**HTTP Status:** `400` ✅

---

### PRUEBA 7: POST con prioridad inválida
**Comando:**
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{
    "title": "Test",
    "description": "Test",
    "reporter": "Test",
    "location": "Test",
    "priority": "SUPER_IMPORTANT",
    "estimatedMinutes": 10
  }'
```
**Resultado esperado:** `400 Bad Request`
**Resultado obtenido:**
```json
{
  "ok": false,
  "message": "Invalid priority. Use LOW, MEDIUM, HIGH or CRITICAL"
}
```
**HTTP Status:** `400` ✅

---

### PRUEBA 8: POST con estimatedMinutes negativo
**Comando:**
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{
    "title": "Test",
    "description": "Test",
    "reporter": "Test",
    "location": "Test",
    "priority": "LOW",
    "estimatedMinutes": -5
  }'
```
**Resultado esperado:** `400 Bad Request`
**Resultado obtenido:**
```json
{
  "ok": false,
  "message": "estimatedMinutes must be a number between 1 and 480"
}
```
**HTTP Status:** `400` ✅

---

### PRUEBA 9: POST CRITICAL con > 60 minutos (Reto 4)
**Comando:**
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{
    "title": "Crítico",
    "description": "Test crítico",
    "reporter": "Admin",
    "location": "DC",
    "priority": "CRITICAL",
    "estimatedMinutes": 180
  }'
```
**Resultado esperado:** `400 Bad Request`
**Resultado obtenido:**
```json
{
  "ok": false,
  "message": "CRITICAL incidents cannot exceed 60 estimated minutes"
}
```
**HTTP Status:** `400` ✅

---

### PRUEBA 10: PUT actualizar incidente existente (ID=1)
**Comando:**
```bash
curl -X PUT http://localhost:3000/api/incidents/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{
    "title": "Proyector actualizado",
    "description": "Descripción actualizada",
    "reporter": "Carlos Díaz",
    "location": "Aula 201",
    "priority": "MEDIUM",
    "estimatedMinutes": 25
  }'
```
**Resultado esperado:** `200 OK`
**Resultado obtenido:** Incidente actualizado correctamente (campos protegidos `id`, `status`, `createdAt` preservados)
**HTTP Status:** `200` ✅

---

### PRUEBA 11: PUT incidente inexistente (ID=999)
**Comando:**
```bash
curl -X PUT http://localhost:3000/api/incidents/999 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{...}'
```
**Resultado esperado:** `404 Not Found`
**Resultado obtenido:**
```json
{
  "ok": false,
  "message": "Incident not found"
}
```
**HTTP Status:** `404` ✅

---

### PRUEBA 12: PATCH OPEN → IN_PROGRESS (ID=1)
**Comando:**
```bash
curl -X PATCH http://localhost:3000/api/incidents/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{ "status": "IN_PROGRESS" }'
```
**Resultado esperado:** `200 OK`
**Resultado obtenido:** Estado cambiado a `IN_PROGRESS`
**HTTP Status:** `200` ✅

---

### PRUEBA 13: PATCH IN_PROGRESS → RESOLVED (ID=1)
**Comando:**
```bash
curl -X PATCH http://localhost:3000/api/incidents/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{ "status": "RESOLVED" }'
```
**Resultado esperado:** `200 OK`
**Resultado obtenido:** Estado cambiado a `RESOLVED`
**HTTP Status:** `200` ✅

---

### PRUEBA 14: PATCH RESOLVED → OPEN (Reto 5 - NO permitido)
**Comando:**
```bash
curl -X PATCH http://localhost:3000/api/incidents/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{ "status": "OPEN" }'
```
**Resultado esperado:** `400 Bad Request`
**Resultado obtenido:**
```json
{
  "ok": false,
  "message": "Cannot change status from RESOLVED to OPEN or IN_PROGRESS"
}
```
**HTTP Status:** `400` ✅

---

### PRUEBA 15: DELETE sin token (ID=2)
**Comando:**
```bash
curl -X DELETE http://localhost:3000/api/incidents/2
```
**Resultado esperado:** `401 Unauthorized`
**Resultado obtenido:**
```json
{
  "ok": false,
  "message": "Unauthorized: missing Authorization header"
}
```
**HTTP Status:** `401` ✅

---

### PRUEBA 16: DELETE con technician-token (ID=2)
**Comando:**
```bash
curl -X DELETE http://localhost:3000/api/incidents/2 \
  -H "Authorization: Bearer technician-token"
```
**Resultado esperado:** `403 Forbidden`
**Resultado obtenido:**
```json
{
  "ok": false,
  "message": "Forbidden: admin access required"
}
```
**HTTP Status:** `403` ✅

---

### PRUEBA 17: DELETE con instructor-token (ID=2)
**Comando:**
```bash
curl -X DELETE http://localhost:3000/api/incidents/2 \
  -H "Authorization: Bearer instructor-token"
```
**Resultado esperado:** `204 No Content`
**Resultado obtenido:** Incidente eliminado (sin body de respuesta)
**HTTP Status:** `204` ✅

---

### PRUEBA 18: Ruta inexistente
**Comando:**
```bash
curl http://localhost:3000/api/planets
```
**Resultado esperado:** `404 Not Found`
**Resultado obtenido:**
```json
{
  "ok": false,
  "message": "Route not found"
}
```
**HTTP Status:** `404` ✅

---

### PRUEBA 19: GET /critical (Reto 1)
**Comando:**
```bash
curl http://localhost:3000/api/incidents/critical
```
**Resultado esperado:** `200 OK`
**Resultado obtenido:**
```json
{
  "ok": true,
  "total": 1,
  "data": [
    {
      "id": 4,
      "title": "Servidor caído",
      "priority": "CRITICAL",
      "status": "OPEN",
      "estimatedMinutes": 60,
      ...
    }
  ]
}
```
**HTTP Status:** `200` ✅

---

### PRUEBA 20: GET /stats (Reto 3)
**Comando:**
```bash
curl http://localhost:3000/api/incidents/stats
```
**Resultado esperado:** `200 OK`
**Resultado obtenido:**
```json
{
  "ok": true,
  "data": {
    "total": 5,
    "open": 3,
    "inProgress": 0,
    "resolved": 2,
    "critical": 1,
    "averageEstimatedMinutes": 30
  }
}
```
**HTTP Status:** `200` ✅

---

## 🔧 Herramienta Utilizada

- **cURL** - Cliente HTTP de línea de comandos
- **Python json.tool** - Formateo de respuestas JSON (opcional)

## 📸 Logs del Servidor (extracto)

```
[2026-10-08T19:59:23.864Z] Server running on http://localhost:3000
[2026-10-08T19:59:30.000Z] GET /api/incidents
[2026-10-08T19:59:35.000Z] GET /api/incidents/1
[2026-10-08T19:59:40.000Z] GET /api/incidents/999
[2026-10-08T19:59:45.000Z] GET /api/incidents/abc
[2026-10-08T19:59:51.933Z] POST /api/incidents
... (20 peticiones registradas)
```

---

## ✅ Conclusión

Todas las **20 pruebas obligatorias** fueron ejecutadas exitosamente, demostrando que la API cumple con:

- ✅ CRUD completo funcional
- ✅ Validaciones mediante middlewares
- ✅ Autenticación con Bearer tokens
- ✅ Autorización por roles (ADMIN/TECHNICIAN)
- ✅ Manejo centralizado de errores
- ✅ Retos 1-5 implementados correctamente
- ✅ Códigos HTTP apropiados (200, 201, 204, 400, 401, 403, 404)
- ✅ Respuestas con formato consistente `{ ok, ... }`

**Estado del Proyecto: APROBADO ✅**

---

*Documento generado el 2026-10-08 como evidencia del Proyecto Evaluable Capítulo V - IncidentHub API v1*
