# Resumen: Admin Seed Data & Control de Acceso por Roles

## ✅ Cambios Implementados

### 1. Admin Automático (DataInitializer)

**Archivo:** `DataInitializer.java`

Al iniciar la aplicación por primera vez:
- ✅ Crea automáticamente un usuario admin
- ✅ Username: `admin@ulasalle.edu.pe`
- ✅ Password: `admin123`
- ✅ Role: `COORDINATOR`

**Cómo funciona:**
```java
if (userRepository.count() == 0) {
    // Crea admin solo si no hay usuarios
}
```

### 2. Endpoint `/register` Protegido

**Antes:**
```java
@PostMapping("/register")
public ResponseEntity<User> register(...) // ❌ Público
```

**Ahora:**
```java
@PostMapping("/register")
@PreAuthorize("hasRole('COORDINATOR')") // ✅ Solo coordinadores
public ResponseEntity<User> register(...)
```

### 3. Control de Acceso por Roles

#### Coordinadores Pueden:
- ✅ Crear usuarios (`POST /api/auth/register`)
- ✅ Crear periodos académicos (`POST /api/academic-periods`)
- ✅ Crear sílabos (`POST /api/syllabi`)
- ✅ Aprobar/rechazar sílabos (`POST /api/syllabi/{id}/status`)
- ✅ Ver todos los sílabos (`GET /api/syllabi`)
- ✅ Ver sus periodos (`GET /api/academic-periods/my-periods`)

#### Profesores Pueden:
- ✅ Ver solo sus sílabos (`GET /api/syllabi`)
- ✅ Actualizar sus sílabos (`PUT /api/syllabi/{id}`)
- ✅ Subir Excel a sus sílabos (`POST /api/syllabi/{id}/upload-excel`)
- ❌ **NO** pueden crear sílabos
- ❌ **NO** pueden crear periodos
- ❌ **NO** pueden cambiar estado de sílabos
- ❌ **NO** pueden crear usuarios

#### Todos (Autenticados) Pueden:
- ✅ Ver lista de usuarios
- ✅ Ver lista de profesores/coordinadores
- ✅ Ver periodos académicos

---

## 🔐 Seguridad Implementada

### SecurityConfig
```java
@EnableMethodSecurity(prePostEnabled = true) // Habilita @PreAuthorize
```

### Endpoints Públicos
- ✅ `POST /api/auth/login` - Login (obtener token)

### Endpoints Protegidos
- 🔒 Todo lo demás requiere token JWT

---

## 🚀 Flujo de Uso

### Primera Vez (Admin Auto-creado)

1. **Iniciar aplicación**
   ```
   Admin creado automáticamente:
   - Username: admin@ulasalle.edu.pe
   - Password: admin123
   ```

2. **Login como admin**
   ```bash
   POST /api/auth/login
   {
     "username": "admin@ulasalle.edu.pe",
     "password": "admin123"
   }
   ```

3. **Crear coordinador**
   ```bash
   POST /api/auth/register
   Authorization: Bearer <admin_token>
   {
     "username": "rescobedo@ulasalle.edu.pe",
     "password": "123",
     "fullName": "Ricardo Escobedo",
     "role": "COORDINATOR"
   }
   ```

4. **Crear profesor**
   ```bash
   POST /api/auth/register
   Authorization: Bearer <admin_token>
   {
     "username": "vmachacaa@ulasalle.edu.pe",
     "password": "123",
     "fullName": "Victor Machaca",
     "role": "PROFESSOR"
   }
   ```

### Flujo Normal (Coordinador)

1. **Login como coordinador**
   ```bash
   POST /api/auth/login
   {
     "username": "rescobedo@ulasalle.edu.pe",
     "password": "123"
   }
   ```

2. **Crear periodo académico**
   ```bash
   POST /api/academic-periods
   Authorization: Bearer <coordinator_token>
   {
     "name": "2025-I",
     "startDate": "2025-03-01",
     "endDate": "2025-07-31"
   }
   ```

3. **Crear sílabo**
   ```bash
   POST /api/syllabi
   Authorization: Bearer <coordinator_token>
   {
     "professorEmail": "vmachacaa@ulasalle.edu.pe",
     "academicPeriodId": 1,
     "courseName": "Arquitectura de Software",
     "courseCode": "SIS501"
   }
   ```

### Flujo Normal (Profesor)

1. **Login como profesor**
   ```bash
   POST /api/auth/login
   {
     "username": "vmachacaa@ulasalle.edu.pe",
     "password": "123"
   }
   ```

2. **Ver sus sílabos**
   ```bash
   GET /api/syllabi
   Authorization: Bearer <professor_token>
   ```

3. **Subir Excel**
   ```bash
   POST /api/syllabi/1/upload-excel
   Authorization: Bearer <professor_token>
   file: test_silabo.xlsx
   ```

4. **Cambiar estado a SUBMITTED**
   ```bash
   POST /api/syllabi/1/status?status=SUBMITTED
   Authorization: Bearer <professor_token>
   ```
   ❌ **ERROR 403** - Solo coordinadores pueden cambiar estado

---

## ❌ Errores Esperados

### Profesor intenta crear sílabo
```bash
POST /api/syllabi
Authorization: Bearer <professor_token>

Response: 403 Forbidden
```

### Usuario sin token intenta registrar
```bash
POST /api/auth/register
# Sin Authorization header

Response: 401 Unauthorized
```

### Profesor intenta aprobar sílabo
```bash
POST /api/syllabi/1/status?status=APPROVED
Authorization: Bearer <professor_token>

Response: 403 Forbidden
```

---

## 📝 Notas Importantes

1. **Admin se crea solo una vez**
   - Solo si `userRepository.count() == 0`
   - Si ya hay usuarios, no se crea

2. **Cambiar password del admin**
   - Recomendado cambiar `admin123` en producción
   - Puedes hacerlo en el código o crear endpoint de cambio de password

3. **Roles en JWT**
   - El token incluye el rol del usuario
   - Spring Security valida automáticamente con `@PreAuthorize`

4. **Múltiples tokens**
   - Un usuario puede tener varios tokens activos
   - Todos son válidos hasta expirar (24h)

---

## 🎯 Para Explicar al Profesor

**Pregunta:** ¿Cómo se crea el primer usuario si todo requiere token?

**Respuesta:**
> "Implementé un patrón llamado 'Seed Data' que es estándar en la industria. Al iniciar la aplicación por primera vez, se crea automáticamente un usuario administrador. Este admin puede hacer login, obtener su token, y crear otros usuarios. Es el mismo patrón que usan sistemas como WordPress, Jira, y muchas aplicaciones empresariales."

**Pregunta:** ¿Por qué un coordinador pudo hacer todo el flujo de profesor?

**Respuesta:**
> "Ahora implementé control de acceso basado en roles (RBAC) usando `@PreAuthorize`. Los coordinadores solo pueden crear sílabos y aprobarlos. Los profesores solo pueden ver sus propios sílabos y actualizarlos. Spring Security valida automáticamente los permisos en cada request."

---

## ✅ Checklist de Pruebas

- [ ] Reiniciar app y verificar que admin se crea
- [ ] Login como admin
- [ ] Crear coordinador con token de admin
- [ ] Crear profesor con token de admin
- [ ] Login como coordinador
- [ ] Crear periodo académico (debe funcionar)
- [ ] Crear sílabo (debe funcionar)
- [ ] Login como profesor
- [ ] Intentar crear sílabo (debe dar 403)
- [ ] Ver solo sus sílabos (debe funcionar)
- [ ] Intentar aprobar sílabo (debe dar 403)
