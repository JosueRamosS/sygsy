# Guía de Pruebas del Backend SYGSY

Esta guía detalla paso a paso cómo probar todos los endpoints implementados usando `curl` (terminal) o Postman.

## 1. Preparación (Base de Datos)
Asegúrate de que tu base de datos `sygsy_db` esté limpia o lista. El sistema creará las tablas automáticamente al iniciar.

## 2. Estructura del Excel (Importante)
Para probar la subida de sílabos, necesitas un archivo Excel (`.xlsx`) donde la **primera hoja** tenga la siguiente estructura (sin encabezados o con encabezados en la fila 1, el sistema salta la primera fila). **El sistema leerá solo la primera fila de datos válida para crear UN sílabo.**

| Columna | Campo | Ejemplo |
| :--- | :--- | :--- |
| A (0) | Facultad | Facultad de Ingeniería |
| B (1) | Carrera | Ingeniería de Sistemas |
| C (2) | Periodo | 2025-I |
| D (3) | Semestre | V |
| E (4) | Créditos | 4 |
| F (5) | Horas Totales | 64 |
| G (6) | Horas Teoría | 32 |
| H (7) | Horas Práctica | 32 |
| I (8) | Área | Formación Especializada |
| J (9) | Código | SIS501 |
| K (10) | Nombre Curso | Arquitectura de Software |
| L (11) | Tipo | Obligatorio |
| M (12) | Prerrequisitos | Ingeniería de Software I |
| N (13) | Email Profesor | profesor@sygsy.com |

> **Nota**: Asegúrate de que el email en la columna N coincida con el usuario profesor que crearás.

## 3. Flujo de Pruebas (Paso a Paso)

### Paso 1: Crear Usuarios (Coordinador y Profesor)
Primero registramos los usuarios para tener acceso.

**Crear Coordinador:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@sygsy.com",
    "password": "123",
    "fullName": "Coordinador Principal",
    "role": "COORDINATOR"
  }'
```

**Crear Profesor:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "profesor@sygsy.com",
    "password": "123",
    "fullName": "Juan Perez",
    "role": "PROFESSOR"
  }'
```

**Listar Usuarios:**
Si quieres verificar qué usuarios existen:
```bash
curl -X GET http://localhost:8080/api/users \
  -u admin@sygsy.com:123
```

**Listar Solo Profesores:**
```bash
curl -X GET http://localhost:8080/api/users/professors \
  -u admin@sygsy.com:123
```

**Listar Solo Coordinadores:**
```bash
curl -X GET http://localhost:8080/api/users/coordinators \
  -u admin@sygsy.com:123
```

---

### Paso 2: Crear Sílabo (Como Coordinador)
El coordinador crea el sílabo inicial asignando profesor y periodo. Esto genera la estructura básica (4 Unidades vacías y 6 Evaluaciones con pesos predefinidos).

```bash
curl -X POST http://localhost:8080/api/syllabi \
  -u admin@sygsy.com:123 \
  -H "Content-Type: application/json" \
  -d '{
    "professorEmail": "profesor@sygsy.com",
    "academicPeriod": "2025-I",
    "courseName": "Arquitectura de Software",
    "courseCode": "SIS501"
  }'
```
*Respuesta esperada:* JSON del sílabo creado con `id`, 4 unidades vacías, y 6 evaluaciones. **Anota el ID** (ej. `1`).

---

### Paso 3: Subir Excel de Datos Generales (Como Coordinador)
El coordinador sube el Excel para completar la información "oficial" del curso en el sílabo recién creado.

```bash
curl -X POST http://localhost:8080/api/syllabi/1/upload-excel \
  -u admin@sygsy.com:123 \
  -F "file=@/Users/jcrdev/Desktop/sílabos/test_silabo.xlsx"
```
*Respuesta esperada:* JSON del sílabo actualizado con los datos del Excel (Facultad, Créditos, etc.).

---

### Paso 4: Listar Sílabos (Como Profesor)
El profesor verifica sus cursos asignados.

```bash
curl -X GET http://localhost:8080/api/syllabi \
  -u profesor@sygsy.com:123
```
*Respuesta esperada:* Lista de sílabos donde `professorEmail` es "profesor@sygsy.com".

---

### Paso 5: Editar Sílabo Completo (Como Profesor)
El profesor llena **toda** la información faltante: competencias, sumilla, unidades con contenido semanal, y evaluaciones con descripciones.

```bash
curl -X PUT http://localhost:8080/api/syllabi/1 \
  -u profesor@sygsy.com:123 \
  -H "Content-Type: application/json" \
  -d '{
    "courseCompetence": "Diseña arquitecturas de software escalables y mantenibles aplicando patrones y principios de diseño.",
    "profileCompetence": "Capacidad de análisis y diseño de sistemas complejos.",
    "previousCompetence": "Conocimientos de programación orientada a objetos, bases de datos y desarrollo web.",
    "sumilla": "Curso que aborda los fundamentos de la arquitectura de software, patrones arquitectónicos, estilos, y técnicas de diseño para sistemas empresariales.",
    "bibliography": "1. Software Architecture in Practice - Bass, Clements, Kazman\n2. Clean Architecture - Robert C. Martin\n3. Patterns of Enterprise Application Architecture - Martin Fowler",
    "activities": "Talleres prácticos de diseño, análisis de casos de estudio, proyecto final de arquitectura de sistema.",
    "units": [
      {
        "unitNumber": 1,
        "title": "UNIDAD I: Fundamentos de Arquitectura",
        "content": "Introducción a la arquitectura de software, conceptos básicos, atributos de calidad.",
        "startDate": "2025-03-10",
        "endDate": "2025-04-05",
        "week1": "Introducción al curso y conceptos de arquitectura",
        "week2": "Atributos de calidad: rendimiento, seguridad, escalabilidad",
        "week3": "Estilos arquitectónicos: capas, cliente-servidor",
        "week4": "Evaluación de arquitecturas"
      },
      {
        "unitNumber": 2,
        "title": "UNIDAD II: Patrones Arquitectónicos",
        "content": "Patrones de diseño arquitectónico, MVC, microservicios, event-driven.",
        "startDate": "2025-04-07",
        "endDate": "2025-05-03",
        "week1": "Patrón MVC y variantes",
        "week2": "Arquitectura de microservicios",
        "week3": "Event-driven architecture",
        "week4": "CQRS y Event Sourcing"
      },
      {
        "unitNumber": 3,
        "title": "UNIDAD III: Diseño de Sistemas Empresariales",
        "content": "Arquitecturas empresariales, integración, APIs, mensajería.",
        "startDate": "2025-05-05",
        "endDate": "2025-05-31",
        "week1": "Diseño de APIs RESTful",
        "week2": "Integración de sistemas",
        "week3": "Mensajería y colas",
        "week4": "Seguridad en arquitecturas distribuidas"
      },
      {
        "unitNumber": 4,
        "title": "UNIDAD IV: Proyecto Final",
        "content": "Aplicación práctica de conceptos, diseño de arquitectura completa.",
        "startDate": "2025-06-02",
        "endDate": "2025-06-28",
        "week1": "Definición de proyecto",
        "week2": "Diseño arquitectónico",
        "week3": "Implementación de prototipo",
        "week4": "Presentación y defensa"
      }
    ],
    "evaluations": [
      {
        "name": "EVIDENCIA 1",
        "weight": 0.10,
        "description": "Taller de análisis de atributos de calidad"
      },
      {
        "name": "EVIDENCIA 2",
        "weight": 0.10,
        "description": "Diseño de arquitectura MVC para caso de estudio"
      },
      {
        "name": "EXAMEN PARCIAL",
        "weight": 0.30,
        "description": "Evaluación teórico-práctica de unidades I y II"
      },
      {
        "name": "EVIDENCIA 3",
        "weight": 0.10,
        "description": "Diseño de API RESTful con documentación"
      },
      {
        "name": "EVIDENCIA 4",
        "weight": 0.10,
        "description": "Implementación de patrón arquitectónico"
      },
      {
        "name": "EXAMEN FINAL",
        "weight": 0.30,
        "description": "Proyecto final: diseño arquitectónico completo y defensa"
      }
    ]
  }'
```

---

### Paso 6: Enviar Sílabo a Revisión (Como Profesor)
El profesor cambia el estado a `SUBMITTED`.

```bash
curl -X POST "http://localhost:8080/api/syllabi/1/status?status=SUBMITTED" \
  -u profesor@sygsy.com:123
```

---

### Paso 7: Listar Sílabos Enviados (Como Coordinador)
El coordinador filtra para ver solo los sílabos enviados para revisión.

```bash
curl -X GET "http://localhost:8080/api/syllabi?status=SUBMITTED" \
  -u admin@sygsy.com:123
```
*Respuesta esperada:* Lista de sílabos con `status: "SUBMITTED"`.

---

### Paso 8: Aprobar Sílabo (Como Coordinador)
El coordinador revisa y aprueba el sílabo.

```bash
curl -X POST "http://localhost:8080/api/syllabi/1/status?status=APPROVED" \
  -u admin@sygsy.com:123
```
*O si quiere devolverlo:* cambiar `APPROVED` por `RETURNED`.

---

### Paso 9: Listar Sílabos Aprobados (Como Coordinador)
El coordinador filtra para ver solo los sílabos aprobados.

```bash
curl -X GET "http://localhost:8080/api/syllabi?status=APPROVED" \
  -u admin@sygsy.com:123
```
*Respuesta esperada:* Lista de sílabos con `status: "APPROVED"`.

---

### Paso 10: Verificar Estado Final
Cualquiera puede consultar el sílabo para ver el estado y todos los datos completos.

```bash
curl -X GET http://localhost:8080/api/syllabi/1 \
  -u admin@sygsy.com:123
```

## Resumen de Endpoints

| Método | URL | Descripción | Auth Requerida |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registrar usuario | No |
| `GET` | `/api/users` | Listar todos los usuarios | Cualquiera (Auth) |
| `GET` | `/api/users/professors` | Listar solo profesores | Cualquiera (Auth) |
| `GET` | `/api/users/coordinators` | Listar solo coordinadores | Cualquiera (Auth) |
| `POST` | `/api/syllabi` | Crear Sílabo (Inicial) | Coordinador |
| `POST` | `/api/syllabi/{id}/upload-excel` | Cargar Datos Generales (Excel) | Coordinador |
| `GET` | `/api/syllabi` | Listar mis sílabos | Cualquiera |
| `GET` | `/api/syllabi?status=SUBMITTED` | Listar sílabos enviados | Coordinador |
| `GET` | `/api/syllabi?status=APPROVED` | Listar sílabos aprobados | Coordinador |
| `GET` | `/api/syllabi/{id}` | Ver detalle sílabo | Cualquiera |
| `PUT` | `/api/syllabi/{id}` | Editar contenido | Profesor |
| `POST` | `/api/syllabi/{id}/status` | Cambiar estado | Ambos (según flujo) |

## Estados del Sílabo

- **CREATED**: Sílabo creado, esperando datos del Excel y edición del profesor
- **ASSIGNED**: (Opcional, no usado actualmente)
- **SUBMITTED**: Profesor envió para revisión
- **APPROVED**: Coordinador aprobó
- **RETURNED**: Coordinador devolvió para correcciones
