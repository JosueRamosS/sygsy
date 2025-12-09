# Sistema de Gestión de Sílabos (SYGSY)

## Overview

Sistema de gestión de sílabos académicos con gestión de periodos académicos, asignación de profesores, carga de datos desde Excel, y flujo de trabajo de aprobación. Incluye campos de auditoría en todas las entidades siguiendo mejores prácticas.

## Características Principales

- ✅ **Gestión de Periodos Académicos**: Los coordinadores pueden crear y gestionar periodos académicos
- ✅ **Asignación de Sílabos**: Asignación de sílabos a profesores específicos
- ✅ **Carga desde Excel**: Importación de datos generales desde archivos Excel
- ✅ **Validación de Email**: Verifica que el email del profesor en el Excel coincida con el asignado
- ✅ **Flujo de Trabajo**: Estados de sílabo (CREATED → SUBMITTED → APPROVED/RETURNED)
- ✅ **Auditoría Completa**: Todos los registros tienen campos de auditoría (creador, modificador, fechas)
- ✅ **Autenticación**: Basic Auth (próximamente JWT)

## Flujo de Trabajo del Sílabo

### Estados del Sílabo (workflowStatus)

1. **CREATED** - El coordinador crea el sílabo y lo asigna a un profesor
2. **SUBMITTED** - El profesor llena el sílabo y lo envía al coordinador para revisión
3. **APPROVED** - El coordinador aprueba el sílabo
4. **RETURNED** - El coordinador devuelve el sílabo al profesor para correcciones

### Proceso Completo

```
Coordinador                    Profesor                    Coordinador
    |                              |                              |
    | 1. Crea sílabo               |                              |
    |    (CREATED)                 |                              |
    |----------------------------->|                              |
    |                              |                              |
    |                              | 2. Llena sílabo              |
    |                              |    y envía (SUBMITTED)       |
    |                              |----------------------------->|
    |                              |                              |
    |                              |                   3. Revisa  |
    |                              |                              |
    |                              |         4a. Aprueba          |
    |                              |<---------  (APPROVED)        |
    |                              |                              |
    |                              |         4b. Devuelve         |
    |                              |<---------  (RETURNED)        |
```

## Changes Implemented

### 1. Domain Entities - Audit Fields

Added audit fields to all domain entities following best practices:
- `status` (String): Entity status (default: "ACTIVE")
- `createdBy` (Long): ID of user who created the entity
- `modifiedBy` (Long): ID of user who last modified the entity  
- `createdAt` (LocalDateTime): Creation timestamp
- `modifiedAt` (LocalDateTime): Last modification timestamp

**Entities Updated:**
- [User.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/domain/User.java)
- [Syllabus.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/domain/Syllabus.java)
- [SyllabusUnit.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/domain/SyllabusUnit.java)
- [Evaluation.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/domain/Evaluation.java)

All entities use JPA lifecycle callbacks (`@PrePersist`, `@PreUpdate`) for automatic timestamp management.

---

### 2. AcademicPeriod Entity

Created new [AcademicPeriod.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/domain/AcademicPeriod.java) entity:

**Fields:**
- `id`: Primary key
- `name`: Unique period name (e.g., "2025-I")
- `startDate`: Period start date
- `endDate`: Period end date
- `coordinator`: ManyToOne relationship to User (who created the period)
- Audit fields (status, createdBy, modifiedBy, createdAt, modifiedAt)

**Key Features:**
- Only coordinators can create academic periods
- Each period tracks which coordinator created it
- Unique constraint on period name

---

### 3. Syllabus Entity Updates

Updated [Syllabus.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/domain/Syllabus.java):

**Changes:**
- Changed `academicPeriod` from String to ManyToOne relationship with `AcademicPeriod` entity
- Added `coordinator` field (ManyToOne to User) to track who created the syllabus
- Renamed `status` to `workflowStatus` to distinguish from audit status field
- Added audit fields

**Impact:**
- Syllabi now have proper relationships to both professor and coordinator
- Academic period is now a first-class entity instead of a string
- Better data integrity and querying capabilities

---

### 4. Repository Layer

**Created:**
- [AcademicPeriodRepository.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/repository/AcademicPeriodRepository.java)
  - `findByName(String name)`: Find period by name
  - `findByCoordinator(User coordinator)`: Find periods created by coordinator

**Updated:**
- [SyllabusRepository.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/repository/SyllabusRepository.java)
  - Changed `findByStatus` to `findByWorkflowStatus` to match renamed field

---

### 5. Service Layer

**Created:**
- [AcademicPeriodService.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/service/AcademicPeriodService.java)
  - `createAcademicPeriod()`: Create new period (coordinator only)
  - `getAllAcademicPeriods()`: List all periods
  - `getAcademicPeriodsByCoordinator()`: List periods by coordinator
  - `getAcademicPeriod()`: Get single period by ID

**Updated:**
- [SyllabusService.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/service/SyllabusService.java)
  - `createSyllabus()`: Now requires coordinator username and academicPeriodId
  - Validates professor exists and has PROFESSOR role
  - Sets coordinator and createdBy fields
  - `updateSyllabusFromExcel()`: **Added email validation**
    - Validates Excel professor email matches syllabus professor email
    - Throws exception with clear error message if mismatch
  - Updated all references from `status` to `workflowStatus`

**Updated:**
- [ExcelService.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/service/ExcelService.java)
  - Removed academicPeriod parsing (column 2 now skipped)
  - Changed `setStatus()` to `setWorkflowStatus()`

---

### 6. Controller Layer

**Created:**
- [AcademicPeriodController.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/controller/AcademicPeriodController.java)
  - `POST /api/academic-periods`: Create period (coordinator only)
  - `GET /api/academic-periods`: List all periods
  - `GET /api/academic-periods/{id}`: Get single period
  - `GET /api/academic-periods/my-periods`: List periods created by authenticated coordinator

**Updated:**
- [SyllabusController.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/controller/SyllabusController.java)
  - `createSyllabus()`: Now passes coordinator username from authentication

---

### 7. DTO Layer

**Created:**
- [CreateAcademicPeriodDTO.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/dto/CreateAcademicPeriodDTO.java)
  - Fields: name, startDate, endDate

**Updated:**
- [CreateSyllabusDTO.java](file:///Users/jcrdev/Desktop/sílabos/src/main/java/com/sygsy/backend/dto/CreateSyllabusDTO.java)
  - Changed `academicPeriod` (String) to `academicPeriodId` (Long)

---

### 8. Test Data Updates

**Updated Postman Collection:**
- Changed coordinator email from `admin@sygsy.com` to `rescobedo@ulasalle.edu.pe`
- Changed professor email from `profesor@sygsy.com` to `vmachacaa@ulasalle.edu.pe`
- Updated all authentication credentials throughout collection
- Changed syllabus creation to use `academicPeriodId: 1` instead of `academicPeriod: "2025-I"`
- Added new "Academic Periods" section with endpoints:
  - Crear Periodo Académico
  - Listar Periodos Académicos

**Updated Excel Test File:**
- Changed professor email in [test_silabo.xlsx](file:///Users/jcrdev/Desktop/sílabos/test_silabo.xlsx) to `vmachacaa@ulasalle.edu.pe`

---

## Verification

### Compilation Status

✅ **All Java files compile successfully** - No compilation errors detected

### Key Validations Implemented

1. **Coordinator Validation**: Only users with COORDINATOR role can create academic periods and syllabi
2. **Professor Validation**: Only users with PROFESSOR role can be assigned to syllabi
3. **Email Validation**: Excel upload validates that professor email matches syllabus professor email
4. **Period Uniqueness**: Academic period names must be unique

---

## Uso del Sistema

### Prerequisitos

- Java 17+
- Base de datos configurada (ver `application.properties`)
- Maven (o usar IDE como IntelliJ IDEA)

### Iniciar la Aplicación

```bash
# Desde IntelliJ IDEA: Run SygsyBackendApplication
# O desde terminal (si tienes Maven):
mvn spring-boot:run
```

### Flujo de Uso Completo

### 1. Register Users

```bash
# Register Coordinator
POST /api/auth/register
{
  "username": "rescobedo@ulasalle.edu.pe",
  "password": "123",
  "fullName": "Ricardo Escobedo",
  "role": "COORDINATOR"
}

# Register Professor
POST /api/auth/register
{
  "username": "vmachacaa@ulasalle.edu.pe",
  "password": "123",
  "fullName": "Victor Machaca",
  "role": "PROFESSOR"
}
```

### 2. Create Academic Period (as Coordinator)

```bash
POST /api/academic-periods
Auth: rescobedo@ulasalle.edu.pe / 123
{
  "name": "2025-I",
  "startDate": "2025-03-01",
  "endDate": "2025-07-31"
}
```

### 3. Create Syllabus (as Coordinator)

```bash
POST /api/syllabi
Auth: rescobedo@ulasalle.edu.pe / 123
{
  "professorEmail": "vmachacaa@ulasalle.edu.pe",
  "academicPeriodId": 1,
  "courseName": "Arquitectura de Software",
  "courseCode": "SIS501"
}
```

### 4. Upload Excel (with matching email)

```bash
POST /api/syllabi/1/upload-excel
Auth: rescobedo@ulasalle.edu.pe / 123
File: test_silabo.xlsx (with vmachacaa@ulasalle.edu.pe)
```

**Expected**: ✅ Success - Data imported

### 5. Upload Excel (with non-matching email) - Negative Test

Modify Excel to have different professor email, then upload.

**Expected**: ❌ Error - "Professor email mismatch! Excel has 'other@email.com' but syllabus is assigned to 'vmachacaa@ulasalle.edu.pe'"

---

## Database Schema Changes

When the application runs, Hibernate will create/update the following tables:

### New Table: `academic_periods`
- id (BIGINT, PK)
- name (VARCHAR, UNIQUE)
- start_date (DATE)
- end_date (DATE)
- coordinator_id (BIGINT, FK to users)
- status (VARCHAR)
- created_id (BIGINT)
- modified_id (BIGINT)
- created (TIMESTAMP)
- modified (TIMESTAMP)

### Updated Table: `syllabi`
- academic_period_id (BIGINT, FK to academic_periods) - **NEW**
- coordinator_id (BIGINT, FK to users) - **NEW**
- workflow_status (VARCHAR) - **RENAMED from status**
- status (VARCHAR) - **NEW (audit field)**
- created_id (BIGINT) - **NEW**
- modified_id (BIGINT) - **NEW**
- created (TIMESTAMP) - **NEW**
- modified (TIMESTAMP) - **NEW**

### Updated Tables: `users`, `syllabus_units`, `evaluations`
All received the same audit fields:
- status (VARCHAR)
- created_id (BIGINT)
- modified_id (BIGINT)
- created (TIMESTAMP)
- modified (TIMESTAMP)

---

## Summary

✅ All domain entities enhanced with audit fields  
✅ AcademicPeriod entity created with coordinator relationship  
✅ Syllabus updated to use AcademicPeriod entity  
✅ Excel upload email validation implemented  
✅ Postman collection updated with ulasalle.edu.pe emails  
✅ Test Excel file updated  
✅ All code compiles successfully  
✅ Ready for testing

**Next Steps**: Start the application and test the workflow using the updated Postman collection.
