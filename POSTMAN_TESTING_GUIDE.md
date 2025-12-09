# Guía de Prueba Completa con Postman

## 🚀 Orden de Ejecución

### Paso 1: Iniciar la Aplicación
```bash
# Reinicia la app para que se cree el admin automáticamente
# Verás en los logs:
========================================
ADMIN USER CREATED AUTOMATICALLY
Username: admin@ulasalle.edu.pe
Password: admin123
Role: COORDINATOR
========================================
```

### Paso 2: Login como Admin (Primera Vez)
📍 **Request:** `Login Admin (First Time)`
```json
POST /api/auth/login
{
  "username": "admin@ulasalle.edu.pe",
  "password": "admin123"
}
```
✅ **Copia el token** de la respuesta y guárdalo en la variable `{{jwt_token}}`

### Paso 3: Crear Coordinador
📍 **Request:** `Registrar Coordinador`
```json
POST /api/auth/register
Authorization: Bearer {{jwt_token}}  // Token del admin
{
  "username": "rescobedo@ulasalle.edu.pe",
  "password": "123",
  "fullName": "Ricardo Escobedo",
  "role": "COORDINATOR"
}
```
✅ Debe funcionar (200 OK)

### Paso 4: Crear Profesor
📍 **Request:** `Registrar Profesor`
```json
POST /api/auth/register
Authorization: Bearer {{jwt_token}}  // Token del admin
{
  "username": "vmachacaa@ulasalle.edu.pe",
  "password": "123",
  "fullName": "Victor Machaca",
  "role": "PROFESSOR"
}
```
✅ Debe funcionar (200 OK)

---

## 🎯 Pruebas de Coordinador

### Paso 5: Login como Coordinador
📍 **Request:** `Login Coordinador`
```json
POST /api/auth/login
{
  "username": "rescobedo@ulasalle.edu.pe",
  "password": "123"
}
```
✅ **Actualiza** la variable `{{jwt_token}}` con este nuevo token

### Paso 6: Crear Periodo Académico
📍 **Request:** `Crear Periodo Académico`
```json
POST /api/academic-periods
Authorization: Bearer {{jwt_token}}  // Token del coordinador
{
  "name": "2025-I",
  "startDate": "2025-03-01",
  "endDate": "2025-07-31"
}
```
✅ Debe funcionar (200 OK)
✅ Copia el `id` del periodo (normalmente será 1)

### Paso 7: Crear Sílabo
📍 **Request:** `1. Crear Sílabo (Coordinador)`
```json
POST /api/syllabi
Authorization: Bearer {{jwt_token}}  // Token del coordinador
{
  "professorEmail": "vmachacaa@ulasalle.edu.pe",
  "academicPeriodId": 1,
  "courseName": "Arquitectura de Software",
  "courseCode": "SIS501"
}
```
✅ Debe funcionar (200 OK)
✅ Copia el `id` del sílabo (normalmente será 1)

### Paso 8: Subir Excel (como Coordinador)
📍 **Request:** `2. Subir Excel Datos Generales`
```
POST /api/syllabi/1/upload-excel
Authorization: Bearer {{jwt_token}}  // Token del coordinador
file: test_silabo.xlsx
```
✅ Debe funcionar (200 OK)

---

## 👨‍🏫 Pruebas de Profesor

### Paso 9: Login como Profesor
📍 **Request:** `Login Profesor`
```json
POST /api/auth/login
{
  "username": "vmachacaa@ulasalle.edu.pe",
  "password": "123"
}
```
✅ **Actualiza** la variable `{{jwt_token}}` con este nuevo token

### Paso 10: Ver Sus Sílabos
📍 **Request:** `Listar Sílabos`
```
GET /api/syllabi
Authorization: Bearer {{jwt_token}}  // Token del profesor
```
✅ Debe funcionar (200 OK)
✅ Solo debe ver el sílabo asignado a él

### Paso 11: Intentar Crear Sílabo (Debe Fallar)
📍 **Request:** `1. Crear Sílabo (Coordinador)`
```json
POST /api/syllabi
Authorization: Bearer {{jwt_token}}  // Token del profesor
{
  "professorEmail": "vmachacaa@ulasalle.edu.pe",
  "academicPeriodId": 1,
  "courseName": "Otro Curso",
  "courseCode": "SIS502"
}
```
❌ **Debe fallar con 403 Forbidden**
✅ Esto demuestra que profesores NO pueden crear sílabos

### Paso 12: Intentar Aprobar Sílabo (Debe Fallar)
📍 **Request:** `Aprobar Sílabo`
```
POST /api/syllabi/1/status?status=APPROVED
Authorization: Bearer {{jwt_token}}  // Token del profesor
```
❌ **Debe fallar con 403 Forbidden**
✅ Esto demuestra que profesores NO pueden aprobar sílabos

### Paso 13: Cambiar Estado a SUBMITTED (Debe Funcionar)
📍 **Request:** `Enviar Sílabo a Revisión`
```
POST /api/syllabi/1/status?status=SUBMITTED
Authorization: Bearer {{jwt_token}}  // Token del profesor
```
❌ **Debe fallar con 403 Forbidden**
⚠️ **NOTA:** Actualmente el endpoint de cambio de estado está protegido solo para coordinadores. Si quieres que profesores puedan enviar a revisión, necesitamos ajustar esto.

---

## 🔄 Flujo Completo de Aprobación

### Paso 14: Login como Coordinador (de nuevo)
📍 **Request:** `Login Coordinador`
✅ Actualiza `{{jwt_token}}`

### Paso 15: Aprobar Sílabo
📍 **Request:** `Aprobar Sílabo`
```
POST /api/syllabi/1/status?status=APPROVED
Authorization: Bearer {{jwt_token}}  // Token del coordinador
```
✅ Debe funcionar (200 OK)

---

## 🧪 Pruebas de Seguridad

### Prueba 1: Registrar sin Token
📍 **Request:** `Registrar Coordinador`
```
POST /api/auth/register
# SIN Authorization header
```
❌ Debe fallar con 401 Unauthorized

### Prueba 2: Profesor Intenta Crear Periodo
📍 **Request:** `Crear Periodo Académico`
```
Authorization: Bearer {{jwt_token}}  // Token del profesor
```
❌ Debe fallar con 403 Forbidden

### Prueba 3: Token Expirado
```
# Espera 24 horas o cambia jwt.expiration a 60000 (1 minuto)
# Intenta usar un token viejo
```
❌ Debe fallar con 401 Unauthorized

---

## 📊 Resumen de Permisos

| Endpoint | Admin | Coordinador | Profesor |
|----------|-------|-------------|----------|
| `POST /api/auth/login` | ✅ | ✅ | ✅ |
| `POST /api/auth/register` | ✅ | ✅ | ❌ |
| `POST /api/academic-periods` | ✅ | ✅ | ❌ |
| `POST /api/syllabi` | ✅ | ✅ | ❌ |
| `POST /api/syllabi/{id}/status` | ✅ | ✅ | ❌ |
| `GET /api/syllabi` | ✅ Todos | ✅ Todos | ✅ Solo suyos |
| `POST /api/syllabi/{id}/upload-excel` | ✅ | ✅ | ✅ |
| `GET /api/users` | ✅ | ✅ | ✅ |

---

## 💡 Tips

1. **Variable de Colección**
   - Crea `{{jwt_token}}` en las variables de colección
   - Actualízala cada vez que hagas login
   - Todas las requests la usarán automáticamente

2. **Orden Importa**
   - Siempre haz login antes de usar otros endpoints
   - Crea periodo académico antes de crear sílabo
   - Usa el token correcto según el rol que quieres probar

3. **Verificar Roles**
   - El token incluye el rol en el payload
   - Puedes decodificarlo en jwt.io para ver el rol
   - Asegúrate de estar usando el token del rol correcto

4. **Reiniciar Base de Datos**
   - Si quieres empezar de cero, cambia `ddl-auto=create` en application.properties
   - Reinicia la app
   - El admin se creará automáticamente de nuevo
