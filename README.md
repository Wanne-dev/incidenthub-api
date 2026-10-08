# IncidentHub API v1

> API REST para la gestión de incidentes tecnológicos en organizaciones

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.2-green?logo=express)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)

---

## 📋 Tabla de Contenidos

- [Problema Solucionado](#-problema-solucionado)
- [Tecnologías](#-tecnologías)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Instalación](#-instalación)
- [Ejecución](#-ejecución)
- [Documentación de Endpoints](#-documentación-de-endpoints)
- [Autenticación](#-autenticación)
- [Explicación de Middlewares](#-explicación-de-middlewares)
- [DTO vs Model](#-dto-vs-model)
- [Reglas de Negocio](#-reglas-de-negocio)
- [Reflexión Obligatoria](#-reflexión-obligatoria)
- [Pruebas](#-pruebas)

---

## 🎯 Problema Solucionado

Una organización cuenta con diferentes áreas de trabajo donde diariamente se presentan **incidentes tecnológicos**:

- 💻 Computadores que no encienden
- 🌐 Fallas de conectividad
- 🖨️ Problemas con impresoras
- 📱 Aplicaciones que dejan de funcionar
- ⚠️ Equipos con comportamientos anormales
- 🚨 Solicitudes urgentes de soporte
- 📈 Incidentes que requieren escalamiento

Actualmente estas novedades se informan mediante **llamadas, mensajes y conversaciones informales**, lo que dificulta llevar control y trazabilidad.

**IncidentHub API** centraliza el registro, consulta, modificación, atención y eliminación de incidentes tecnológicos, proporcionando trazabilidad completa y respuestas HTTP consistentes.

---

## 🛠️ Tecnologías

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 20+ | Entorno de ejecución |
| Express | 5.2 | Framework web |
| TypeScript | 5.9 | Tipado estático |
| ts-node-dev | 2.0 | Desarrollo con hot-reload |

**Persistencia:** En memoria mediante arrays de TypeScript (sin base de datos en v1)

---

## 🏗️ Arquitectura del Proyecto

```
incidenthub-api/
├── src/
│   ├── controllers/          # Lógica de negocio (handlers de endpoints)
│   │   └── incident.controller.ts
│   ├── data/                 # Capa de datos (persistencia en memoria)
│   │   └── incidents.data.ts
│   ├── dtos/                 # Data Transfer Objects (contratos de entrada)
│   │   └── incident.dto.ts
│   ├── errors/               # Clases de error personalizadas
│   │   └── app-error.ts
│   ├── middlewares/          # Middlewares (validación, auth, logging, errores)
│   │   ├── admin.middleware.ts
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── logger.middleware.ts
│   │   ├── not-found.middleware.ts
│   │   ├── request-info.middleware.ts
│   │   ├── validate-id.middleware.ts
│   │   ├── validate-incident.middleware.ts
│   │   ├── validate-priority.middleware.ts
│   │   └── validate-time.middleware.ts
│   ├── models/               # Modelos de dominio (interfaces internos)
│   │   └── incident.model.ts
│   ├── routes/               # Definición de rutas
│   │   └── incident.routes.ts
│   ├── app.ts                # Configuración de Express
│   └── server.ts             # Punto de entrada del servidor
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
└── EVIDENCIAS.md             # Documento de pruebas realizadas
```

### Flujo de una Petición

```
HTTP Request
     ↓
┌─────────────┐
│   Logger    │  ← Registra la petición
└─────────────┘
     ↓
┌─────────────┐
│ RequestInfo │  ← Enriquece el objeto request
└─────────────┘
     ↓
┌─────────────┐
│    Auth     │  ← Valida token (rutas protegidas)
└─────────────┘
     ↓
┌─────────────┐
│ Validate ID │  ← Valida parámetro :id
└─────────────┘
     ↓
┌─────────────────┐
│ Validate Incident│ ← Valida campos requeridos
│ Validate Priority│ ← Valida enum de prioridad
│ Validate Time   │ ← Valida estimatedMinutes (Reto 4)
└─────────────────┘
     ↓
┌─────────────┐
│  Controller │  ← Lógica de negocio
└─────────────┘
     ↓
┌─────────────┐
│    Data     │  ← Persistencia en memoria
└─────────────┘
     ↓
HTTP Response (200/201/204)

En caso de error:
     ↓
┌─────────────┐
│  AppError   │  ← Error controlado con status code
└─────────────┘
     ↓
┌─────────────┐
│ Error Handler│ ← Respuesta HTTP uniforme
└─────────────┘
```

---

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Wanne-dev/incidenthub-api.git

# Entrar al directorio
cd incidenthub-api

# Instalar dependencias
npm install
```

---

## ▶️ Ejecución

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Compilar TypeScript
npm run build

# Modo producción
npm start
```

El servidor se inicia en: **http://localhost:3000**

---

## 📡 Documentación de Endpoints

### Base URL: `http://localhost:3000/api/incidents`

| Método | Ruta | Descripción | Auth | Respuesta |
|--------|------|-------------|------|-----------|
| `GET` | `/` | Obtener todos los incidentes | No | `200 OK` |
| `GET` | `/:id` | Obtener incidente por ID | No | `200 / 404` |
| `POST` | `/` | Registrar nuevo incidente | Sí | `201 Created` |
| `PUT` | `/:id` | Actualizar incidente | Sí | `200 / 404` |
| `PATCH` | `/:id/status` | Cambiar estado | Sí | `200 / 400 / 404` |
| `DELETE` | `/:id` | Eliminar incidente | Sí (Admin) | `204 / 401 / 403 / 404` |
| `GET` | `/critical` | Incidentes críticos (Reto 1) | No | `200 OK` |
| `GET` | `/pending` | Incidentes pendientes (Reto 2) | No | `200 OK` |
| `GET` | `/stats` | Estadísticas (Reto 3) | No | `200 OK` |

### Ejemplos de Peticiones

#### Obtener todos los incidentes
```bash
curl http://localhost:3000/api/incidents
```

#### Obtener incidente por ID
```bash
curl http://localhost:3000/api/incidents/1
```

#### Crear incidente
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

#### Cambiar estado
```bash
curl -X PATCH http://localhost:3000/api/incidents/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{ "status": "IN_PROGRESS" }'
```

#### Eliminar incidente (solo admin)
```bash
curl -X DELETE http://localhost:3000/api/incidents/3 \
  -H "Authorization: Bearer instructor-token"
```

---

## 🔐 Autenticación

Las operaciones protegidas requieren el header `Authorization` con formato **Bearer token**:

| Token | Rol | Permisos |
|-------|-----|----------|
| `Bearer instructor-token` | **ADMIN** | GET, POST, PUT, PATCH, **DELETE** |
| `Bearer technician-token` | **TECHNICIAN** | GET, POST, PUT, PATCH |

### Códigos de Error de Autenticación

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| `401` | Unauthorized | Token faltante o inválido |
| `403` | Forbidden | Técnico intenta operación de admin (DELETE) |

---

## 🧩 Explicación de Middlewares

| Middleware | Propósito |
|------------|-----------|
| **logger** | Registra cada petición con timestamp, método y ruta en consola |
| **requestInfo** | Enriquece el objeto `Request` con metadatos (timestamp, método, path) |
| **authenticate** | Valida el header `Authorization` con tokens Bearer; asigna el rol |
| **requireAdmin** | Restringe acceso a rutas administrativas (solo rol ADMIN) |
| **validateId** | Valida que `:id` sea un número entero positivo |
| **validateIncident** | Verifica que todos los campos requeridos estén presentes |
| **validatePriority** | Valida que `priority` sea LOW, MEDIUM, HIGH o CRITICAL |
| **validateTime** | Valida `estimatedMinutes` (1-480) y aplica regla CRITICAL ≤ 60 min |
| **notFound** | Maneja rutas inexistentes con respuesta 404 uniforme |
| **errorHandler** | Centraliza el manejo de errores; convierte AppError en respuestas HTTP |

---

## 📊 DTO vs Model

### Model (`Incident`)
Representa **cómo existe el objeto dentro de la aplicación**. Contiene todos los campos, incluyendo los que el servidor genera automáticamente:

```typescript
interface Incident {
  id: number;              // ← Generado por el servidor
  title: string;
  description: string;
  reporter: string;
  location: string;
  priority: IncidentPriority;
  status: IncidentStatus;  // ← Inicia como "OPEN", generado por el servidor
  estimatedMinutes: number;
  createdAt: string;       // ← Generado por el servidor (ISO timestamp)
}
```

### DTO (`CreateIncidentDto`)
Representa **el contrato estricto de datos que el cliente puede enviar**. Define únicamente los campos permitidos en la petición de creación:

```typescript
interface CreateIncidentDto {
  title: string;
  description: string;
  reporter: string;
  location: string;
  priority: IncidentPriority;
  estimatedMinutes: number;
  // ❌ NO incluye: id, status, createdAt
}
```

### ¿Por qué separarlos?

| Aspecto | Beneficio |
|---------|-----------|
| **Seguridad** | El cliente no puede inyectar `id`, `status` o `createdAt` |
| **Control** | El servidor mantiene la integridad de los datos generados |
| **Claridad** | Cada interfaz tiene una responsabilidad única |
| **Evolución** | Se pueden cambiar los DTOs sin afectar el modelo interno |

> 💡 **Analogía:** El Model es como la ficha completa de un paciente en el hospital (incluye historial, diagnósticos, fechas internas). El DTO es como el formulario que el paciente llena en recepción (solo datos que él proporciona).

---

## ⚙️ Reglas de Negocio

### Reto 4 - Incidentes Críticos
> Cuando `priority = "CRITICAL"`, `estimatedMinutes` **no puede superar 60 minutos**.

**Justificación técnica:** Esta regla se implementó en el middleware `validateTime` porque valida restricciones de tiempo que están directamente ligados al campo `priority`. Es una validación **cross-field** (valida la relación entre dos campos), por lo que pertenece a la capa de validación, no al controlador.

### Reto 5 - Transición de Estados

```
PERMITIDO:                    NO PERMITIDO:
OPEN → IN_PROGRESS            RESOLVED → OPEN
IN_PROGRESS → RESOLVED        RESOLVED → IN_PROGRESS
OPEN → RESOLVED (directo)
```

Una vez que un incidente está `RESOLVED`, no puede volver a `OPEN` ni `IN_PROGRESS`. Esto garantiza la integridad del flujo de trabajo.

---

## 🤔 Reflexión Obligatoria

> **¿Qué ventajas ofrece implementar validaciones, autenticación y manejo de errores mediante middlewares en lugar de escribir toda esta lógica directamente dentro de cada controller?**

Implementar validaciones, autenticación y manejo de errores mediante middlewares ofrece ventajas fundamentales para el desarrollo profesional de software:

1. **Separación de Responsabilidades (SoC):** Al extraer la lógica transversal de los controladores, estos quedan limpios y centrados exclusivamente en su propósito de negocio. Un controller no debería preocuparse por validar si un ID es numérico o si el token es válido; su trabajo es procesar la solicitud y retornar una respuesta.

2. **Reutilización de Código:** Un mismo middleware (como `authenticate` o `validateId`) puede aplicarse a múltiples rutas sin duplicar código. Si mañana necesito proteger 20 endpoints, solo agrego el middleware a cada ruta, no copio y pego la lógica de validación 20 veces.

3. **Mantenibilidad:** Si necesito cambiar la lógica de autenticación (por ejemplo, migrar de tokens simples a JWT), solo modifico un archivo (`auth.middleware.ts`) en lugar de buscar y editar cada controller que tenga esa validación.

4. **Testabilidad:** Los middlewares son funciones independientes que pueden testearse de forma aislada. Puedo probar `validateTime` sin necesidad de levantar todo el servidor o hacer peticiones HTTP.

5. **Orden y Predecibilidad:** Express ejecuta los middlewares en el orden en que se registran. Esto crea un flujo predecible: primero se loguea, luego se autentica, luego si valida, y finalmente se ejecuta el controller. Cualquier desarrollador puede entender el flujo de una petición con solo ver el archivo de rutas.

6. **Manejo Unificado de Errores:** Al centralizar los errores en un middleware dedicado, garantizo que todas las respuestas de error tengan el mismo formato (`{ ok: false, message: "..." }`). Sin esta centralización, cada controller tendría su propia forma de manejar errores, resultando en inconsistencias.

7. **Escalabilidad:** A medida que la aplicación crece, los middlewares permiten agregar nuevas capas (como rate limiting, caching, o compresión) sin modificar la lógica de negocio existente.

En resumen, los middlewares transforman el código de un conjunto de funciones acopladas a una **arquitectura en capas** donde cada componente tiene una responsabilidad clara, resultando en un sistema más robusto, mantenible y profesional.

---

## 🧪 Pruebas

Ver el documento **[EVIDENCIAS.md](./EVIDENCIAS.md)** para la documentación completa de las 20 pruebas realizadas, incluyendo comandos cURL y respuestas esperadas.

### Resumen de Pruebas Obligatorias

| # | Prueba | Resultado Esperado |
|---|--------|-------------------|
| 1 | GET todos los incidentes | `200` |
| 2 | GET incidente existente | `200` |
| 3 | GET incidente inexistente | `404` |
| 4 | GET con ID `abc` | `400` |
| 5 | POST válido | `201` |
| 6 | POST sin título | `400` |
| 7 | POST prioridad inválida | `400` |
| 8 | POST estimatedMinutes negativo | `400` |
| 9 | POST CRITICAL > 60 min | `400` |
| 10 | PUT existente | `200` |
| 11 | PUT inexistente | `404` |
| 12 | PATCH OPEN → IN_PROGRESS | `200` |
| 13 | PATCH IN_PROGRESS → RESOLVED | `200` |
| 14 | PATCH RESOLVED → OPEN | `400` |
| 15 | DELETE sin token | `401` |
| 16 | DELETE con technician-token | `403` |
| 17 | DELETE con instructor-token | `204` |
| 18 | Ruta inexistente | `404` |
| 19 | GET /critical | `200` |
| 20 | GET /stats | `200` |

---

## 📝 Historial de Desarrollo

Este proyecto fue desarrollado siguiendo **GitHub Flow** con ramas feature:

| Rama | Propósito |
|------|-----------|
| `main` | Rama principal (producción) |
| `develop` | Rama de integración |
| `feature/01-project-setup` | Configuración inicial del proyecto |
| `feature/02-models-and-dtos` | Modelos y DTOs |
| `feature/03-data-layer` | Capa de datos con incidentes iniciales |
| `feature/04-controllers` | Controladores con lógica de negocio |
| `feature/05-validation-middlewares` | Middlewares de validación |
| `feature/06-auth-middlewares` | Autenticación y autorización |
| `feature/07-error-handling` | Manejo centralizado de errores |
| `feature/08-routes-and-server` | Rutas y servidor |
| `feature/09-documentation` | Documentación (este README) |
| `feature/10-testing-evidence` | Evidencias de pruebas |

---

## 📜 Licencia

ISC © Wanne-dev

---

## 👨‍💻 Autor

**Wanne-dev** - [GitHub](https://github.com/Wanne-dev)

Proyecto desarrollado como parte del **Capítulo V - Proyecto Evaluable** del programa de formación.
