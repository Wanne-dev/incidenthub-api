# 🧪 GUÍA DE PRUEBAS POR MÉTODO HTTP

> Cómo probar cada método (GET, POST, PUT, PATCH, DELETE) con ejemplos listos para copiar y pegar.

**Servidor debe estar corriendo:** `npm run dev` → `http://localhost:3000`

---

## 📋 RESUMEN DE MÉTODOS

| Método | Uso | Endpoints |
|--------|-----|-----------|
| **GET** | Consultar (leer) | `/`, `/:id`, `/critical`, `/pending`, `/stats` |
| **POST** | Crear | `/` |
| **PUT** | Actualizar completo | `/:id` |
| **PATCH** | Actualizar parcial (solo estado) | `/:id/status` |
| **DELETE** | Eliminar | `/:id` |

---

## 🔵 1. MÉTODO GET (Consultar - SIN token)

### GET - Todos los incidentes
```bash
curl http://localhost:3000/api/incidents
```
**Respuesta esperada:** `200 OK` con array de 5 incidentes

---

### GET - Incidente por ID (existente)
```bash
curl http://localhost:3000/api/incidents/1
```
**Respuesta esperada:** `200 OK` con el incidente ID 1

---

### GET - Incidente por ID (NO existente)
```bash
curl http://localhost:3000/api/incidents/999
```
**Respuesta esperada:** `404 Not Found`
```json
{ "ok": false, "message": "Incident not found" }
```

---

### GET - ID inválido (no es número)
```bash
curl http://localhost:3000/api/incidents/abc
```
**Respuesta esperada:** `400 Bad Request`
```json
{ "ok": false, "message": "Invalid incident id" }
```

---

### GET - ID negativo
```bash
curl http://localhost:3000/api/incidents/-3
```
**Respuesta esperada:** `400 Bad Request`

---

### GET - Incidentes CRÍTICOS (Reto 1)
```bash
curl http://localhost:3000/api/incidents/critical
```
**Respuesta esperada:** `200 OK` solo incidentes con `priority: "CRITICAL"`

---

### GET - Incidentes PENDIENTES (Reto 2)
```bash
curl http://localhost:3000/api/incidents/pending
```
**Respuesta esperada:** `200 OK` solo incidentes `OPEN` o `IN_PROGRESS` (sin `RESOLVED`)

---

### GET - Estadísticas (Reto 3)
```bash
curl http://localhost:3000/api/incidents/stats
```
**Respuesta esperada:** `200 OK`
```json
{
  "ok": true,
  "data": {
    "total": 5,
    "open": 3,
    "inProgress": 1,
    "resolved": 1,
    "critical": 1,
    "averageEstimatedMinutes": 44
  }
}
```

---

### GET - Ruta inexistente (404 global)
```bash
curl http://localhost:3000/api/planets
```
**Respuesta esperada:** `404 Not Found`
```json
{ "ok": false, "message": "Route not found" }
```

---

## 🟢 2. MÉTODO POST (Crear - CON token)

### POST - Crear incidente VÁLIDO ✅
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{
    "title": "Monitor parpadea",
    "description": "La pantalla tiene parpadeos constantes",
    "reporter": "María López",
    "location": "Oficina 305",
    "priority": "MEDIUM",
    "estimatedMinutes": 30
  }'
```
**Respuesta esperada:** `201 Created`
```json
{
  "ok": true,
  "data": {
    "title": "Monitor parpadea",
    "description": "La pantalla tiene parpadeos constantes",
    "reporter": "María López",
    "location": "Oficina 305",
    "priority": "MEDIUM",
    "estimatedMinutes": 30,
    "id": 6,
    "status": "OPEN",
    "createdAt": "2026-10-08T20:30:00.000Z"
  }
}
```
> 💡 Nota: `id`, `status` y `createdAt` los asigna el servidor automáticamente

---

### POST - SIN token ❌ (401)
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","reporter":"Test","location":"Test","priority":"LOW","estimatedMinutes":10}'
```
**Respuesta esperada:** `401 Unauthorized`
```json
{ "ok": false, "message": "Unauthorized: missing Authorization header" }
```

---

### POST - Token inválido ❌ (401)
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token-falso" \
  -d '{"title":"Test","description":"Test","reporter":"Test","location":"Test","priority":"LOW","estimatedMinutes":10}'
```
**Respuesta esperada:** `401 Unauthorized`

---

### POST - Falta campo requerido ❌ (400)
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"title":"Solo título"}'
```
**Respuesta esperada:** `400 Bad Request`
```json
{ "ok": false, "message": "Missing required fields: title, description, reporter, location, priority, estimatedMinutes" }
```

---

### POST - Prioridad inválida ❌ (400)
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"title":"Test","description":"Test","reporter":"Test","location":"Test","priority":"SUPER_IMPORTANT","estimatedMinutes":10}'
```
**Respuesta esperada:** `400 Bad Request`
```json
{ "ok": false, "message": "Invalid priority. Use LOW, MEDIUM, HIGH or CRITICAL" }
```

---

### POST - estimatedMinutes negativo ❌ (400)
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"title":"Test","description":"Test","reporter":"Test","location":"Test","priority":"LOW","estimatedMinutes":-5}'
```
**Respuesta esperada:** `400 Bad Request`

---

### POST - estimatedMinutes mayor a 480 ❌ (400)
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"title":"Test","description":"Test","reporter":"Test","location":"Test","priority":"LOW","estimatedMinutes":500}'
```
**Respuesta esperada:** `400 Bad Request`
```json
{ "ok": false, "message": "estimatedMinutes must be a number between 1 and 480" }
```

---

### POST - CRITICAL con más de 60 min ❌ (400 - Reto 4)
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"title":"Emergencia","description":"Servidor caído","reporter":"Admin","location":"DC","priority":"CRITICAL","estimatedMinutes":180}'
```
**Respuesta esperada:** `400 Bad Request`
```json
{ "ok": false, "message": "CRITICAL incidents cannot exceed 60 estimated minutes" }
```

---

### POST - CRITICAL con 60 min ✅ (Válido - Reto 4)
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"title":"Emergencia","description":"Servidor caído","reporter":"Admin","location":"DC","priority":"CRITICAL","estimatedMinutes":60}'
```
**Respuesta esperada:** `201 Created` ✅ (60 minutos es el límite permitido)

---

## 🟡 3. MÉTODO PUT (Actualizar - CON token)

### PUT - Actualizar incidente existente ✅
```bash
curl -X PUT http://localhost:3000/api/incidents/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{
    "title": "Proyector reparado",
    "description": "Ya funciona correctamente",
    "reporter": "Carlos Díaz",
    "location": "Aula 201",
    "priority": "LOW",
    "estimatedMinutes": 15
  }'
```
**Respuesta esperada:** `200 OK` con el incidente actualizado

> ⚠️ Nota: `id`, `status` y `createdAt` NO se pueden modificar (campos protegidos)

---

### PUT - Incidente NO existente ❌ (404)
```bash
curl -X PUT http://localhost:3000/api/incidents/999 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"title":"Test","description":"Test","reporter":"Test","location":"Test","priority":"LOW","estimatedMinutes":10}'
```
**Respuesta esperada:** `404 Not Found`

---

### PUT - Intentar modificar ID (se ignora)
```bash
curl -X PUT http://localhost:3000/api/incidents/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"id":999,"title":"Test","description":"Test","reporter":"Test","location":"Test","priority":"LOW","estimatedMinutes":10}'
```
**Respuesta esperada:** `200 OK` pero el `id` sigue siendo `1` (campo protegido)

---

### PUT - Intentar modificar status (se ignora)
```bash
curl -X PUT http://localhost:3000/api/incidents/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"status":"RESOLVED","title":"Test","description":"Test","reporter":"Test","location":"Test","priority":"LOW","estimatedMinutes":10}'
```
**Respuesta esperada:** `200 OK` pero el `status` NO cambia (usa PATCH para eso)

---

## 🟠 4. MÉTODO PATCH (Cambiar estado - CON token)

### PATCH - OPEN → IN_PROGRESS ✅
```bash
curl -X PATCH http://localhost:3000/api/incidents/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"status":"IN_PROGRESS"}'
```
**Respuesta esperada:** `200 OK` con `status: "IN_PROGRESS"`

---

### PATCH - IN_PROGRESS → RESOLVED ✅
```bash
curl -X PATCH http://localhost:3000/api/incidents/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"status":"RESOLVED"}'
```
**Respuesta esperada:** `200 OK` con `status: "RESOLVED"`

---

### PATCH - RESOLVED → OPEN ❌ (400 - Reto 5)
```bash
curl -X PATCH http://localhost:3000/api/incidents/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"status":"OPEN"}'
```
**Respuesta esperada:** `400 Bad Request`
```json
{ "ok": false, "message": "Cannot change status from RESOLVED to OPEN or IN_PROGRESS" }
```

---

### PATCH - Estado inválido ❌ (400)
```bash
curl -X PATCH http://localhost:3000/api/incidents/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"status":"CERRADO"}'
```
**Respuesta esperada:** `400 Bad Request`
```json
{ "ok": false, "message": "Invalid status. Use OPEN, IN_PROGRESS or RESOLVED" }
```

---

### PATCH - Incidente NO existente ❌ (404)
```bash
curl -X PATCH http://localhost:3000/api/incidents/999/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{"status":"IN_PROGRESS"}'
```
**Respuesta esperada:** `404 Not Found`

---

## 🔴 5. MÉTODO DELETE (Eliminar - SOLO ADMIN)

### DELETE - SIN token ❌ (401)
```bash
curl -X DELETE http://localhost:3000/api/incidents/3
```
**Respuesta esperada:** `401 Unauthorized`

---

### DELETE - Con TECHNICIAN ❌ (403)
```bash
curl -X DELETE http://localhost:3000/api/incidents/3 \
  -H "Authorization: Bearer technician-token"
```
**Respuesta esperada:** `403 Forbidden`
```json
{ "ok": false, "message": "Forbidden: admin access required" }
```

---

### DELETE - Con ADMIN (instructor-token) ✅ (204)
```bash
curl -X DELETE http://localhost:3000/api/incidents/3 \
  -H "Authorization: Bearer instructor-token"
```
**Respuesta esperada:** `204 No Content` (sin body)

---

### DELETE - Verificar que se eliminó
```bash
curl http://localhost:3000/api/incidents/3
```
**Respuesta esperada:** `404 Not Found` (ya no existe)

---

### DELETE - Incidente NO existente ❌ (404)
```bash
curl -X DELETE http://localhost:3000/api/incidents/999 \
  -H "Authorization: Bearer instructor-token"
```
**Respuesta esperada:** `404 Not Found`

---

## 📊 TABLA RESUMEN: LAS 20 PRUEBAS OBLIGATORIAS

| # | Método | Comando | Esperado | Resultado |
|---|--------|---------|----------|-----------|
| 1 | GET | `curl .../api/incidents` | 200 | ✅ |
| 2 | GET | `curl .../api/incidents/1` | 200 | ✅ |
| 3 | GET | `curl .../api/incidents/999` | 404 | ✅ |
| 4 | GET | `curl .../api/incidents/abc` | 400 | ✅ |
| 5 | POST | Crear válido con token | 201 | ✅ |
| 6 | POST | Sin título | 400 | ✅ |
| 7 | POST | Prioridad inválida | 400 | ✅ |
| 8 | POST | estimatedMinutes negativo | 400 | ✅ |
| 9 | POST | CRITICAL > 60 min | 400 | ✅ |
| 10 | PUT | Actualizar existente | 200 | ✅ |
| 11 | PUT | Actualizar inexistente | 404 | ✅ |
| 12 | PATCH | OPEN → IN_PROGRESS | 200 | ✅ |
| 13 | PATCH | IN_PROGRESS → RESOLVED | 200 | ✅ |
| 14 | PATCH | RESOLVED → OPEN | 400 | ✅ |
| 15 | DELETE | Sin token | 401 | ✅ |
| 16 | DELETE | Con technician-token | 403 | ✅ |
| 17 | DELETE | Con instructor-token | 204 | ✅ |
| 18 | GET | Ruta inexistente `/api/planets` | 404 | ✅ |
| 19 | GET | `/critical` | 200 | ✅ |
| 20 | GET | `/stats` | 200 | ✅ |

---

## 🖥️ Probar con Postman / Thunder Client (VS Code)

### Configuración rápida en Postman:

1. **Crear nueva colección:** "IncidentHub API"
2. **Agregar variable de entorno:**
   - `baseUrl` = `http://localhost:3000`
   - `techToken` = `Bearer technician-token`
   - `adminToken` = `Bearer instructor-token`

### Requests para crear:

| Nombre | Método | URL | Headers | Body |
|--------|--------|-----|---------|------|
| Get All | GET | `{{baseUrl}}/api/incidents` | - | - |
| Get by ID | GET | `{{baseUrl}}/api/incidents/1` | - | - |
| Create | POST | `{{baseUrl}}/api/incidents` | `Authorization: {{techToken}}` + `Content-Type: application/json` | JSON válido |
| Update | PUT | `{{baseUrl}}/api/incidents/1` | `Authorization: {{techToken}}` + `Content-Type: application/json` | JSON válido |
| Change Status | PATCH | `{{baseUrl}}/api/incidents/1/status` | `Authorization: {{techToken}}` + `Content-Type: application/json` | `{ "status": "IN_PROGRESS" }` |
| Delete | DELETE | `{{baseUrl}}/api/incidents/1` | `Authorization: {{adminToken}}` | - |
| Get Critical | GET | `{{baseUrl}}/api/incidents/critical` | - | - |
| Get Pending | GET | `{{baseUrl}}/api/incidents/pending` | - | - |
| Get Stats | GET | `{{baseUrl}}/api/incidents/stats` | - | - |

---

## 🧪 Script de Prueba Rápida (Todas las pruebas en uno)

Guarda esto como `test-api.sh` y ejecútalo:

```bash
#!/bin/bash

BASE="http://localhost:3000/api/incidents"
TECH="Authorization: Bearer technician-token"
ADMIN="Authorization: Bearer instructor-token"

echo "🧪 === PRUEBAS IncidentHub API ==="
echo ""

echo "1️⃣ GET todos (esperado: 200)"
curl -s -o /dev/null -w "Status: %{http_code}
" $BASE

echo "2️⃣ GET ID=1 (esperado: 200)"
curl -s -o /dev/null -w "Status: %{http_code}
" $BASE/1

echo "3️⃣ GET ID=999 (esperado: 404)"
curl -s -o /dev/null -w "Status: %{http_code}
" $BASE/999

echo "4️⃣ GET ID=abc (esperado: 400)"
curl -s -o /dev/null -w "Status: %{http_code}
" $BASE/abc

echo "5️⃣ POST válido (esperado: 201)"
curl -s -o /dev/null -w "Status: %{http_code}
" -X POST $BASE \
  -H "Content-Type: application/json" \
  -H "$TECH" \
  -d '{"title":"Test","description":"Test","reporter":"Test","location":"Test","priority":"LOW","estimatedMinutes":10}'

echo "6️⃣ POST sin título (esperado: 400)"
curl -s -o /dev/null -w "Status: %{http_code}
" -X POST $BASE \
  -H "Content-Type: application/json" \
  -H "$TECH" \
  -d '{"description":"Sin título"}'

echo "7️⃣ POST prioridad inválida (esperado: 400)"
curl -s -o /dev/null -w "Status: %{http_code}
" -X POST $BASE \
  -H "Content-Type: application/json" \
  -H "$TECH" \
  -d '{"title":"T","description":"T","reporter":"T","location":"T","priority":"MALO","estimatedMinutes":10}'

echo "8️⃣ POST tiempo negativo (esperado: 400)"
curl -s -o /dev/null -w "Status: %{http_code}
" -X POST $BASE \
  -H "Content-Type: application/json" \
  -H "$TECH" \
  -d '{"title":"T","description":"T","reporter":"T","location":"T","priority":"LOW","estimatedMinutes":-5}'

echo "9️⃣ POST CRITICAL >60 (esperado: 400)"
curl -s -o /dev/null -w "Status: %{http_code}
" -X POST $BASE \
  -H "Content-Type: application/json" \
  -H "$TECH" \
  -d '{"title":"T","description":"T","reporter":"T","location":"T","priority":"CRITICAL","estimatedMinutes":180}'

echo "🔟 PUT ID=1 (esperado: 200)"
curl -s -o /dev/null -w "Status: %{http_code}
" -X PUT $BASE/1 \
  -H "Content-Type: application/json" \
  -H "$TECH" \
  -d '{"title":"Actualizado","description":"Test","reporter":"Test","location":"Test","priority":"LOW","estimatedMinutes":10}'

echo "1️⃣1️⃣ PUT ID=999 (esperado: 404)"
curl -s -o /dev/null -w "Status: %{http_code}
" -X PUT $BASE/999 \
  -H "Content-Type: application/json" \
  -H "$TECH" \
  -d '{"title":"T","description":"T","reporter":"T","location":"T","priority":"LOW","estimatedMinutes":10}'

echo "1️⃣2️⃣ PATCH OPEN→IN_PROGRESS (esperado: 200)"
curl -s -o /dev/null -w "Status: %{http_code}
" -X PATCH $BASE/2/status \
  -H "Content-Type: application/json" \
  -H "$TECH" \
  -d '{"status":"IN_PROGRESS"}'

echo "1️⃣3️⃣ PATCH IN_PROGRESS→RESOLVED (esperado: 200)"
curl -s -o /dev/null -w "Status: %{http_code}
" -X PATCH $BASE/2/status \
  -H "Content-Type: application/json" \
  -H "$TECH" \
  -d '{"status":"RESOLVED"}'

echo "1️⃣4️⃣ PATCH RESOLVED→OPEN (esperado: 400)"
curl -s -o /dev/null -w "Status: %{http_code}
" -X PATCH $BASE/2/status \
  -H "Content-Type: application/json" \
  -H "$TECH" \
  -d '{"status":"OPEN"}'

echo "1️⃣5️⃣ DELETE sin token (esperado: 401)"
curl -s -o /dev/null -w "Status: %{http_code}
" -X DELETE $BASE/3

echo "1️⃣6️⃣ DELETE technician (esperado: 403)"
curl -s -o /dev/null -w "Status: %{http_code}
" -X DELETE $BASE/3 -H "$TECH"

echo "1️⃣7️⃣ DELETE admin (esperado: 204)"
curl -s -o /dev/null -w "Status: %{http_code}
" -X DELETE $BASE/3 -H "$ADMIN"

echo "1️⃣8️⃣ Ruta inexistente (esperado: 404)"
curl -s -o /dev/null -w "Status: %{http_code}
" http://localhost:3000/api/planets

echo "1️⃣9️⃣ GET /critical (esperado: 200)"
curl -s -o /dev/null -w "Status: %{http_code}
" $BASE/critical

echo "2️⃣0️⃣ GET /stats (esperado: 200)"
curl -s -o /dev/null -w "Status: %{http_code}
" $BASE/stats

echo ""
echo "✅ === FIN DE PRUEBAS ==="
```

**Para ejecutar:**
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 📝 Notas Importantes

| Aspecto | Detalle |
|---------|---------|
| **GET** | No necesita token (son públicos) |
| **POST/PUT/PATCH** | Necesitan `Authorization: Bearer technician-token` |
| **DELETE** | Necesita `Authorization: Bearer instructor-token` (solo admin) |
| **Content-Type** | Siempre `application/json` para POST/PUT/PATCH |
| **Body** | Solo para POST, PUT, PATCH (GET y DELETE no llevan body) |

---

*Guía de pruebas creada para IncidentHub API v1*
