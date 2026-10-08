# 📚 GUÍA DE ESTUDIO - SUSTENTACIÓN IncidentHub API

> Documento para prepararte para la sustentación oral con el profesor.
> Explica el flujo completo, qué hace cada archivo, y cómo responder preguntas técnicas.

---

## 🏗️ 1. ARQUITECTURA POR CAPAS (¿Qué va en cada carpeta?)

```
┌─────────────────────────────────────────┐
│           CLIENTE (Postman/cURL)        │
│         HTTP Request → Response         │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  📁 src/server.ts                       │
│  Punto de entrada. Inicia el servidor.  │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  📁 src/app.ts                          │
│  Configura Express y el orden de        │
│  middlewares globales.                  │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  📁 src/routes/                         │
│  Define las URLs y qué middlewares      │
│  se aplican a cada endpoint.            │
│  incident.routes.ts                     │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  📁 src/middlewares/                    │
│  "Filtros" que procesan la petición     │
│  ANTES de llegar al controlador:        │
│  • logger, requestInfo (logging)        │
│  • authenticate, requireAdmin (seguridad)│
│  • validateId, validateIncident, etc.   │
│  • errorHandler, notFound (errores)     │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  📁 src/controllers/                    │
│  Lógica de negocio. Recibe la petición  │
│  ya validada y autenticada. Procesa     │
│  los datos y genera la respuesta.       │
│  incident.controller.ts                 │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  📁 src/data/                           │
│  Persistencia en memoria (array).       │
│  incidents.data.ts                      │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  📁 src/models/ + 📁 src/dtos/          │
│  Definen la estructura de los datos.    │
│  • models: cómo existe internamente     │
│  • dtos: qué puede enviar el cliente    │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  📁 src/errors/                         │
│  Clase AppError para errores controlados│
│  con código HTTP específico.            │
└─────────────────────────────────────────┘
```

---

## 📂 2. EXPLICACIÓN DE CADA CARPETA (¿Por qué existe?)

### 📁 `src/models/` - El Modelo
**¿Qué es?** La representación interna de la entidad en la aplicación.

**Archivo:** `incident.model.ts`

```typescript
// El Model tiene TODOS los campos, incluyendo los que genera el servidor
export interface Incident {
  id: number;           // ← Solo el servidor asigna esto
  title: string;
  description: string;
  reporter: string;
  location: string;
  priority: IncidentPriority;  // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  status: IncidentStatus;      // "OPEN" | "IN_PROGRESS" | "RESOLVED"
  estimatedMinutes: number;
  createdAt: string;    // ← Solo el servidor asigna esto
}
```

**¿Por qué existe?**
- Define la estructura completa del objeto en la base de datos/memoria
- Incluye campos internos que el cliente NO debe controlar
- Es la "verdad" de cómo existe el dato en el sistema

---

### 📁 `src/dtos/` - Data Transfer Object
**¿Qué es?** El contrato de lo que el cliente PUEDE enviar.

**Archivo:** `incident.dto.ts`

```typescript
// El DTO solo tiene los campos que el cliente envía
export interface CreateIncidentDto {
  title: string;
  description: string;
  reporter: string;
  location: string;
  priority: IncidentPriority;
  estimatedMinutes: number;
  // ❌ NO tiene: id, status, createdAt
}
```

**¿Por qué existe?**
- **Seguridad:** El cliente no puede enviar `id: 999` o `status: "RESOLVED"` falsos
- **Claridad:** Define explícitamente qué se espera en cada operación
- **Validación:** Facilita validar solo los campos permitidos

**Diferencia clave Model vs DTO:**

| Aspecto | Model | DTO |
|---------|-------|-----|
| **Quién lo usa** | Servidor interno | Cliente externo |
| **Campos** | Todos (incluye generados) | Solo los que envía el cliente |
| **id** | ✅ Sí | ❌ No |
| **status** | ✅ Sí | ❌ No |
| **createdAt** | ✅ Sí | ❌ No |
| **Analogía** | Ficha completa del paciente | Formulario de ingreso |

---

### 📁 `src/data/` - Capa de Datos
**¿Qué es?** Donde se almacenan los datos (en memoria en esta v1).

**Archivo:** `incidents.data.ts`

```typescript
// Array en memoria con 5 incidentes iniciales
export let incidents: Incident[] = [
  { id: 1, title: "Proyector sin señal", ... },
  { id: 2, title: "Falla de red", ... },
  // ... 3 más
];
```

**¿Por qué existe?**
- Separa la persistencia de la lógica de negocio
- Si mañana cambias a MongoDB/PostgreSQL, solo modificas esta carpeta
- El controlador no sabe DÓNDE se guardan los datos, solo pide el array

---

### 📁 `src/controllers/` - Controlador
**¿Qué es?** La lógica de negocio. Procesa la petición y genera la respuesta.

**Archivo:** `incident.controller.ts`

```typescript
// Cada función es un "handler" para un endpoint
export const getIncidents = (req: Request, res: Response) => {
  // 1. Obtiene los datos
  // 2. Procesa (si es necesario)
  // 3. Genera la respuesta HTTP
  res.status(200).json({ ok: true, total: incidents.length, data: incidents });
};
```

**¿Qué hace cada función?**

| Función | Endpoint | Qué hace |
|---------|----------|----------|
| `getIncidents` | GET / | Retorna todos los incidentes |
| `getIncidentById` | GET /:id | Busca uno por ID, 404 si no existe |
| `createIncident` | POST / | Crea uno nuevo, asigna id/status/createdAt |
| `updateIncident` | PUT /:id | Actualiza campos permitidos |
| `updateStatus` | PATCH /:id/status | Cambia solo el estado (con reglas) |
| `deleteIncident` | DELETE /:id | Elimina del array |
| `getCritical` | GET /critical | Filtra priority === "CRITICAL" |
| `getPending` | GET /pending | Filtra status OPEN o IN_PROGRESS |
| `getStats` | GET /stats | Calcula estadísticas dinámicas |

**¿Por qué existe?**
- Contiene la lógica de negocio pura
- No sabe de HTTP (eso lo manejan los middlewares)
- No sabe de validación (eso lo hacen los middlewares)
- Solo procesa datos y retorna resultados

---

### 📁 `src/middlewares/` - Middlewares
**¿Qué es?** Funciones que se ejecutan ANTES (o DESPUÉS) del controlador.

**Los 10 middlewares del proyecto:**

| # | Archivo | Tipo | ¿Qué hace? |
|---|---------|------|-----------|
| 1 | `logger.middleware.ts` | Global | Imprime en consola cada petición |
| 2 | `request-info.middleware.ts` | Global | Agrega `req.requestInfo` con metadatos |
| 3 | `auth.middleware.ts` | Seguridad | Valida token Bearer, asigna rol |
| 4 | `admin.middleware.ts` | Seguridad | Verifica que el rol sea ADMIN |
| 5 | `validate-id.middleware.ts` | Validación | Verifica que :id sea entero positivo |
| 6 | `validate-incident.middleware.ts` | Validación | Verifica campos requeridos |
| 7 | `validate-priority.middleware.ts` | Validación | Verifica enum de prioridad |
| 8 | `validate-time.middleware.ts` | Validación | Verifica estimatedMinutes + regla CRITICAL |
| 9 | `error.middleware.ts` | Error | Convierte errores en respuestas HTTP |
| 10 | `not-found.middleware.ts` | Error | Responde 404 para rutas inexistentes |

**¿Qué es un Middleware?**

```typescript
// Estructura de un middleware
export const miMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. Hacer algo con la petición
  console.log("Llegó una petición");
  
  // 2. ¿Todo bien? Pasar al siguiente
  next();  // ← Continúa la cadena
  
  // 3. ¿Algo mal? Detener y enviar error
  // next(new AppError(400, "Error encontrado"));
};
```

**¿Qué hace `next()`?**
- `next()` → Pasa al siguiente middleware o al controlador
- `next(err)` → Salta al middleware de errores
- Sin `next()` → La petición se "cuelga" (timeout)

---

### 📁 `src/errors/` - Manejo de Errores
**¿Qué es?** Clase personalizada para errores con código HTTP.

**Archivo:** `app-error.ts`

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,  // 400, 401, 403, 404, 500...
    message: string
  ) {
    super(message);
  }
}
```

**¿Cómo se usa?**

```typescript
// En un controlador o middleware:
if (!incident) {
  return next(new AppError(404, "Incident not found"));
  //     ↑ Pasa el error al errorHandler
}
```

**¿Por qué existe?**
- Centraliza el manejo de errores
- Cada error tiene su código HTTP asociado
- El `errorHandler` middleware los convierte en respuestas uniformes

---

### 📁 `src/routes/` - Rutas
**¿Qué es?** Define las URLs y qué middlewares aplican a cada una.

**Archivo:** `incident.routes.ts`

```typescript
const router = Router();

// Rutas específicas ANTES de /:id (para evitar colisión)
router.get("/critical", getCritical);
router.get("/pending", getPending);
router.get("/stats", getStats);

// CRUD básico
router.get("/", getIncidents);
router.get("/:id", validateId, getIncidentById);
//           ↑ middleware    ↑ controlador

// POST con autenticación + validaciones
router.post("/",
  authenticate,        // 1. ¿Tiene token?
  validateIncident,    // 2. ¿Faltan campos?
  validatePriority,    // 3. ¿Prioridad válida?
  validateTime,        // 4. ¿Tiempo válido?
  createIncident       // 5. Crear incidente
);
```

**Orden de middlewares en una ruta:**
```
POST /api/incidents
    ↓
authenticate → ¿Token válido? → 401 si no
    ↓
validateIncident → ¿Campos completos? → 400 si no
    ↓
validatePriority → ¿Prioridad válida? → 400 si no
    ↓
validateTime → ¿Tiempo válido? → 400 si no
    ↓
createIncident → Crear y responder 201
```

---

## 🔄 3. FLUJO COMPLETO DE UNA PETICIÓN

### Ejemplo A: `GET /api/incidents/1` (Éxito)

```
PASO 1: Cliente envía petición
    GET http://localhost:3000/api/incidents/1
                    ↓
PASO 2: server.ts inicia el servidor
    app.listen(3000)
                    ↓
PASO 3: app.ts - Middlewares globales
    ├─ express.json()     → Parsea el body (si hay)
    ├─ logger             → Imprime: [2026-10-08...] GET /api/incidents/1
    └─ requestInfo        → Agrega req.requestInfo = { timestamp, method, path }
                    ↓
PASO 4: app.ts monta las rutas
    app.use("/api/incidents", incidentRoutes)
                    ↓
PASO 5: incident.routes.ts encuentra la ruta
    router.get("/:id", validateId, getIncidentById)
                    ↓
PASO 6: Middleware validateId
    ├─ Extrae req.params.id = "1"
    ├─ Convierte a número: Number("1") = 1
    ├─ ¿Es entero positivo? ✅ SÍ
    └─ next() → Continúa
                    ↓
PASO 7: Controlador getIncidentById
    ├─ Busca en incidents: incidents.find(i => i.id === 1)
    ├─ ¿Encontró? ✅ SÍ
    └─ res.status(200).json({ ok: true, data: incident })
                    ↓
PASO 8: Cliente recibe respuesta
    HTTP 200 OK
    {
      "ok": true,
      "data": {
        "id": 1,
        "title": "Proyector sin señal",
        ...
      }
    }
```

---

### Ejemplo B: `GET /api/incidents/abc` (ID inválido - ¡Tu pregunta!)

```
PASO 1: Cliente envía petición
    GET http://localhost:3000/api/incidents/abc
                    ↓
PASO 2-4: Igual que el ejemplo anterior
    (server → app → middlewares globales → routes)
                    ↓
PASO 5: incident.routes.ts encuentra la ruta
    router.get("/:id", validateId, getIncidentById)
                    ↓
PASO 6: Middleware validateId  ← AQUÍ SE DETIENE
    ├─ Extrae req.params.id = "abc"
    ├─ Convierte a número: Number("abc") = NaN
    ├─ ¿Es entero positivo?
    │   Number.isInteger(NaN) = false ❌
    ├─ ¡FALLA LA VALIDACIÓN!
    └─ return next(new AppError(400, "Invalid incident id"))
                    ↓
    ⚠️ NOTA: El controlador NUNCA se ejecuta
                    ↓
PASO 7: El error viaja al errorHandler
    app.use(errorHandler)  ← Registrado al final en app.ts
                    ↓
PASO 8: errorHandler procesa el error
    ├─ ¿Es AppError? ✅ SÍ
    ├─ statusCode = 400
    └─ res.status(400).json({
         ok: false,
         message: "Invalid incident id"
       })
                    ↓
PASO 9: Cliente recibe respuesta de error
    HTTP 400 Bad Request
    {
      "ok": false,
      "message": "Invalid incident id"
    }
```

**¿Qué capas se dispararon?**

| Capa | ¿Se ejecutó? | ¿Por qué? |
|------|-------------|-----------|
| `server.ts` | ✅ Sí | Inicia el servidor |
| `app.ts` (json, logger, requestInfo) | ✅ Sí | Middlewares globales |
| `routes/incident.routes.ts` | ✅ Sí | Encuentra la ruta |
| `middlewares/validate-id` | ✅ Sí | **Se ejecuta y FALLA** |
| `controllers/incident.controller.ts` | ❌ **NO** | Nunca llegó, validateId lo detuvo |
| `data/incidents.data.ts` | ❌ **NO** | No se consultó la data |
| `middlewares/error.middleware.ts` | ✅ Sí | Recibe el AppError |
| `errors/app-error.ts` | ✅ Sí | Se creó el error |

**Respuesta al profe:**
> "Cuando el ID es inválido como `abc`, el middleware `validateId` detecta que `Number("abc")` produce `NaN`, que no es un entero positivo. Entonces llama a `next()` pasando un `AppError` con código 400. El controlador **nunca se ejecuta** porque el middleware detuvo la cadena. El `errorHandler` captura ese error y responde con HTTP 400."

---

### Ejemplo C: `POST /api/incidents` (Crear incidente - Flujo completo)

```
Cliente envía:
POST /api/incidents
Authorization: Bearer technician-token
{
  "title": "Router sin conectividad",
  "description": "El router perdió conexión",
  "reporter": "Ana Torres",
  "location": "Piso 2",
  "priority": "HIGH",
  "estimatedMinutes": 40
}
                    ↓
┌────────────────────────────────────────┐
│  MIDDLEWARES GLOBALES (app.ts)         │
├────────────────────────────────────────┤
│  1. express.json() → Parsea el body    │
│  2. logger → Imprime la petición       │
│  3. requestInfo → Enriquece req        │
└────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────┐
│  MIDDLEWARES DE RUTA (routes.ts)       │
├────────────────────────────────────────┤
│  4. authenticate                       │
│     ├─ Lee header Authorization        │
│     ├─ ¿Es "Bearer technician-token"?  │
│     ├─ ✅ SÍ → req.userRole = "TECHNICIAN" │
│     └─ next()                          │
│                                        │
│  5. validateIncident                   │
│     ├─ ¿Faltan campos?                 │
│     ├─ title ✅, description ✅, ...    │
│     └─ next()                          │
│                                        │
│  6. validatePriority                   │
│     ├─ ¿priority es válido?            │
│     ├─ "HIGH" ∈ [LOW, MEDIUM, HIGH, CRITICAL] ✅ │
│     └─ next()                          │
│                                        │
│  7. validateTime                       │
│     ├─ ¿estimatedMinutes es número? ✅ 40 │
│     ├─ ¿Está entre 1 y 480? ✅         │
│     ├─ ¿Es CRITICAL con > 60? ❌ No es CRITICAL │
│     └─ next()                          │
└────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────┐
│  CONTROLADOR (incident.controller.ts)  │
├────────────────────────────────────────┤
│  createIncident(req, res)              │
│                                        │
│  1. Recibe el DTO:                     │
│     const dto: CreateIncidentDto = req.body │
│                                        │
│  2. Crea el Model completo:            │
│     const newIncident: Incident = {    │
│       ...dto,           // campos del cliente │
│       id: 6,            // ← Auto-generado (max + 1) │
│       status: "OPEN",   // ← Siempre inicia OPEN │
│       createdAt: "2026-10-08T..." // ← Fecha actual │
│     }                                  │
│                                        │
│  3. Guarda en la data:                 │
│     incidents.push(newIncident)        │
│                                        │
│  4. Responde:                          │
│     res.status(201).json({             │
│       ok: true,                        │
│       data: newIncident                │
│     })                                 │
└────────────────────────────────────────┘
                    ↓
Cliente recibe:
HTTP 201 Created
{
  "ok": true,
  "data": {
    "id": 6,
    "title": "Router sin conectividad",
    "status": "OPEN",
    "createdAt": "2026-10-08T...",
    ...
  }
}
```

---

### Ejemplo D: `DELETE /api/incidents/2` sin token (401)

```
Cliente envía:
DELETE /api/incidents/2
(SIN header Authorization)
                    ↓
Middlewares globales (logger, requestInfo) ✅
                    ↓
Ruta: router.delete("/:id", authenticate, requireAdmin, validateId, deleteIncident)
                    ↓
┌────────────────────────────────────────┐
│  authenticate                          │
├────────────────────────────────────────┤
│  const authHeader = req.headers.authorization │
│  // authHeader = undefined             │
│                                        │
│  if (!authHeader) {                    │
│    return next(new AppError(401,       │
│      "Unauthorized: missing Authorization header"))
│  }                                     │
│                                        │
│  ❌ FALLA → next(error)                │
│  ⚠️ requireAdmin, validateId, deleteIncident NUNCA se ejecutan │
└────────────────────────────────────────┘
                    ↓
errorHandler → HTTP 401
{
  "ok": false,
  "message": "Unauthorized: missing Authorization header"
}
```

---

### Ejemplo E: `DELETE` con technician-token (403)

```
DELETE /api/incidents/2
Authorization: Bearer technician-token
                    ↓
authenticate ✅ → req.userRole = "TECHNICIAN"
                    ↓
requireAdmin ← AQUÍ FALLA
├─ if (req.userRole !== "ADMIN")
├─ "TECHNICIAN" !== "ADMIN" → true
└─ return next(new AppError(403, "Forbidden: admin access required"))
                    ↓
⚠️ validateId y deleteIncident NUNCA se ejecutan
                    ↓
errorHandler → HTTP 403
{
  "ok": false,
  "message": "Forbidden: admin access required"
}
```

---

## 📖 4. GLOSARIO DE TÉRMINOS

| Término | Definición Simple | Analogía |
|---------|------------------|----------|
| **API REST** | Interfaz que usa HTTP (GET, POST, PUT, DELETE) para comunicar sistemas | Como un menú de restaurante: tú pides (GET), ordenas (POST), modificas (PUT), cancelas (DELETE) |
| **Endpoint** | Una URL específica que hace algo | `/api/incidents` es un endpoint, `/api/incidents/1` es otro |
| **Middleware** | Función que se ejecuta ANTES del controlador | Como seguridad en un aeropuerto: revisan tu equipaje ANTES de abordar |
| **Controller** | Función que contiene la lógica de negocio | El "mesero" que toma tu orden y la lleva a la cocina |
| **Model** | Estructura completa del dato interno | La ficha médica completa de un paciente |
| **DTO** | Estructura de lo que el cliente puede enviar | El formulario que llenas al entrar al hospital |
| **next()** | Función para pasar al siguiente middleware | "Siguiente, por favor" en una fila |
| **AppError** | Error personalizado con código HTTP | Una alarma con código específico (400, 404, etc.) |
| **Bearer Token** | Token de autenticación en el header | Tu boleto de abordaje: demuestra quién eres |
| **CRUD** | Create, Read, Update, Delete | Crear, Leer, Actualizar, Borrar |
| **In-memory** | Datos en RAM (se pierden al reiniciar) | Una pizarra: escribes, pero se borra al limpiar |
| **TypeScript** | JavaScript con tipos | JavaScript con "etiquetas" que dicen qué tipo es cada cosa |

---

## 🎤 5. PREGUNTAS TÍPICAS DEL PROFE Y RESPUESTAS

### Pregunta 1: "Explica la diferencia entre un DTO y un Model"

**Respuesta:**
> "El **Model** representa cómo existe el incidente **dentro** de mi aplicación. Tiene todos los campos: `id`, `status`, `createdAt`, que son generados por el servidor. El **DTO** (`CreateIncidentDto`) es el **contrato** de lo que el cliente **puede enviar**. No incluye `id`, `status` ni `createdAt` porque esos los genera el servidor. Esto evita que un usuario malicioso envíe `status: 'RESOLVED'` o un `id` falso. Es como la diferencia entre la ficha completa de un paciente (Model) y el formulario de ingreso que él llena (DTO)."

---

### Pregunta 2: "¿Qué hace `next()`?"

**Respuesta:**
> "`next()` es la función que pasa la petición al **siguiente middleware** en la cadena, o al controlador si no hay más middlewares. Sin `next()`, la petición se queda "colgada" y nunca responde. Si hago `next(error)`, salto directamente al middleware de errores. Por ejemplo, en `validateId`, si el ID es válido hago `next()` para ir al controlador; si es inválido hago `next(new AppError(400, ...))` para ir al `errorHandler`."

---

### Pregunta 3: "Modifica una regla de validación"

**Respuesta (ejemplo):**
> "Voy a cambiar la regla de `estimatedMinutes` para que el máximo sea 240 minutos en lugar de 480. Esto lo hago en `src/middlewares/validate-time.middleware.ts`:"

```typescript
// ANTES:
if (typeof estimatedMinutes !== 'number' || estimatedMinutes <= 0 || estimatedMinutes > 480) {

// DESPUÉS:
if (typeof estimatedMinutes !== 'number' || estimatedMinutes <= 0 || estimatedMinutes > 240) {
```

> "Como la validación está en un middleware separado, solo toco ese archivo y no el controlador. Eso demuestra la ventaja de separar responsabilidades."

---

### Pregunta 4: "Crea un nuevo middleware"

**Respuesta (ejemplo):**
> "Voy a crear un middleware que verifique que el título tenga al menos 5 caracteres. Lo agrego en `src/middlewares/validate-title.middleware.ts`:"

```typescript
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

export const validateTitle = (req: Request, res: Response, next: NextFunction) => {
  const { title } = req.body;
  if (!title || title.length < 5) {
    return next(new AppError(400, "Title must be at least 5 characters"));
  }
  next();
};
```

> "Y lo agrego en la ruta en `incident.routes.ts`:"

```typescript
router.post("/", authenticate, validateIncident, validateTitle, validatePriority, validateTime, createIncident);
```

> "Listo, el nuevo middleware se ejecuta entre `validateIncident` y `validatePriority`."

---

### Pregunta 5: "Explica el orden de los middlewares"

**Respuesta:**
> "El orden es crucial. En `app.ts` tengo:

```typescript
app.use(express.json());    // 1. Parsea el body JSON
app.use(logger);            // 2. Loguea la petición
app.use(requestInfo);       // 3. Enriquece el request
app.use("/api/incidents", incidentRoutes);  // 4. Rutas
app.use(notFound);          // 5. 404 para rutas inexistentes
app.use(errorHandler);      // 6. Manejo de errores (SIEMPRE AL FINAL)
```

> El `errorHandler` DEBE ir al final porque los middlewares de error tienen 4 parámetros `(err, req, res, next)` y Express solo los ejecuta si hay un error. Si lo pongo antes, nunca captura errores de las rutas.

> Dentro de una ruta, por ejemplo POST, el orden es:
> `authenticate → validateIncident → validatePriority → validateTime → controller`
>
> Primero autentico (¿quién eres?), luego valido (¿los datos están bien?), y al final ejecuto la lógica de negocio."

---

### Pregunta 6: "Ejecuta una petición incorrecta"

**Respuesta:**
> "Voy a ejecutar `GET /api/incidents/abc` que tiene un ID inválido:"

```bash
curl http://localhost:3000/api/incidents/abc
```

> "Respuesta:"
```json
{
  "ok": false,
  "message": "Invalid incident id"
}
```
> "HTTP 400. ¿Por qué? Porque en la ruta `/:id` tengo el middleware `validateId` que convierte `"abc"` a número con `Number("abc")` que da `NaN`. Como `NaN` no es un entero positivo, el middleware crea un `AppError(400, ...)` y llama a `next(error)`. El `errorHandler` lo captura y responde 400. El controlador `getIncidentById` **nunca se ejecutó**."

---

### Pregunta 7: "Muestra cómo funciona el Error Middleware"

**Respuesta:**
> "El `errorHandler` en `src/middlewares/error.middleware.ts` tiene esta firma especial con **4 parámetros**:"

```typescript
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    // Error controlado: uso el statusCode del AppError
    return res.status(err.statusCode).json({ ok: false, message: err.message });
  }
  // Error inesperado: 500 genérico (no expongo detalles internos)
  res.status(500).json({ ok: false, message: "Internal server error" });
};
```

> "Express identifica que es un middleware de error porque tiene **4 parámetros**. El primero (`err`) recibe cualquier error pasado con `next(error)` o lanzado con `throw`.
>
> Si es un `AppError` (lo checkeo con `instanceof`), uso su `statusCode` y `message`. Si es cualquier otro error (bug del código), respondo 500 genérico para no exponer información sensible."

---

### Pregunta 8: "Explica la diferencia entre 400, 401, 403, 404 y 500"

**Respuesta:**

| Código | Nombre | Significado | Ejemplo en mi proyecto |
|--------|--------|-------------|------------------------|
| **400** | Bad Request | El cliente envió datos inválidos | ID no es número, falta un campo, prioridad inválida |
| **401** | Unauthorized | No está autenticado (¿quién eres?) | Falta el token o el token es incorrecto |
| **403** | Forbidden | Está autenticado pero no tiene permiso (¿qué puedes hacer?) | Técnico intenta hacer DELETE (solo admin) |
| **404** | Not Found | El recurso no existe | Incidente con ID 999 no existe, ruta inexistente |
| **500** | Internal Server Error | Error del servidor (bug del código) | Error inesperado no controlado |

> "La diferencia clave: **401** es 'no sé quién eres', **403** es 'sé quién eres pero no puedes hacer eso'."

---

### Pregunta 9: "Crea un nuevo incidente desde Postman"

**Pasos:**
1. Abrir Postman
2. Método: **POST**
3. URL: `http://localhost:3000/api/incidents`
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer technician-token`
5. Body (raw, JSON):
```json
{
  "title": "Impresora no funciona",
  "description": "La impresora del piso 3 no imprime",
  "reporter": "Juan Pérez",
  "location": "Piso 3",
  "priority": "MEDIUM",
  "estimatedMinutes": 20
}
```
6. Click **Send**
7. Respuesta esperada: **201 Created** con el incidente creado (id, status=OPEN, createdAt asignados por el servidor)

---

### Pregunta 10: "Muestra cómo se protege DELETE"

**Respuesta:**
> "En `incident.routes.ts`, la ruta DELETE tiene DOS middlewares de seguridad:"

```typescript
router.delete("/:id",
  authenticate,      // 1. ¿Tienes token válido?
  requireAdmin,      // 2. ¿Eres ADMIN?
  validateId,        // 3. ¿El ID es válido?
  deleteIncident     // 4. Eliminar
);
```

> "Prueba 1 - Sin token:"
```bash
curl -X DELETE http://localhost:3000/api/incidents/1
# → 401 Unauthorized
```

> "Prueba 2 - Con technician-token:"
```bash
curl -X DELETE http://localhost:3000/api/incidents/1 \
  -H "Authorization: Bearer technician-token"
# → 403 Forbidden (no eres admin)
```

> "Prueba 3 - Con instructor-token (ADMIN):"
```bash
curl -X DELETE http://localhost:3000/api/incidents/1 \
  -H "Authorization: Bearer instructor-token"
# → 204 No Content (eliminado)
```

> "La protección tiene **3 capas**: primero verifico identidad (401), luego autorización (403), y finalmente valido el recurso (400/404)."

---

## 🧠 6. RESUMEN PARA MEMORIZAR

### Flujo de una petición (happy path):
```
Cliente → server.ts → app.ts (json, logger, requestInfo)
        → routes (encuentra endpoint)
        → middlewares de validación/auth (en orden)
        → controller (lógica de negocio)
        → data (consulta/modifica array)
        → respuesta HTTP al cliente
```

### Flujo de una petición (con error):
```
Cliente → server.ts → app.ts → routes
        → middleware detecta error
        → next(new AppError(código, mensaje))
        → errorHandler captura
        → respuesta HTTP de error al cliente
        (⚠️ El controlador NUNCA se ejecuta)
```

### Orden de middlewares en app.ts:
```
1. express.json()      - Parsea body
2. logger              - Log de petición
3. requestInfo         - Metadatos
4. /api/incidents      - Rutas
5. notFound            - 404
6. errorHandler        - Errores (¡SIEMPRE AL FINAL!)
```

### Códigos HTTP que uso:

| Código | Cuándo lo uso |
|--------|---------------|
| 200 | GET exitoso, PUT exitoso, PATCH exitoso |
| 201 | POST exitoso (recurso creado) |
| 204 | DELETE exitoso (sin contenido) |
| 400 | Datos inválidos (validación falló) |
| 401 | Sin autenticación (falta/inválido token) |
| 403 | Sin autorización (no eres admin) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## ✅ CHECKLIST PARA LA SUSTENTACIÓN

Antes de presentarle al profe, asegúrate de poder:

- [ ] Explicar qué hace cada carpeta (models, dtos, data, controllers, middlewares, errors, routes)
- [ ] Dibujar el flujo de una petición en una pizarra/papel
- [ ] Explicar la diferencia entre Model y DTO con tus propias palabras
- [ ] Explicar qué hace `next()` y por qué es importante
- [ ] Mostrar en vivo una petición con error (ej: ID inválido)
- [ ] Modificar una validación en vivo (cambiar 480 a 240)
- [ ] Crear un middleware nuevo en vivo
- [ ] Explicar el orden de middlewares y por qué el errorHandler va al final
- [ ] Diferenciar 400, 401, 403, 404, 500 con ejemplos de tu proyecto
- [ ] Crear un incidente desde Postman/cURL
- [ ] Mostrar cómo se protege DELETE (3 pruebas: sin token, technician, instructor)

---

*Documento creado para preparación de sustentación - IncidentHub API v1*
*Autor: Wanne-dev*
