# Guía Rápida: Usar Postman con JWT

## Paso 1: Hacer Login

1. Abre Postman
2. Selecciona la request **"Login (JWT)"** en la carpeta "Auth & Users"
3. Click en **Send**
4. Copia el `token` de la respuesta

**Ejemplo de respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQ09PUkRJTkFUT1IiLCJzdWIiOiJyZXNjb2JlZG9AdWxhc2FsbGUuZWR1LnBlIiwiaWF0IjoxNzAwODYwMDAwLCJleHAiOjE3MDA5NDY0MDB9.abc123...",
  "username": "rescobedo@ulasalle.edu.pe",
  "role": "COORDINATOR",
  "expiresIn": 86400
}
```

## Paso 2: Configurar Variable de Entorno (Recomendado)

### Opción A: Variable de Colección (Más fácil)

1. Click derecho en la colección "SYGSY API"
2. Edit → Variables
3. Agrega una variable:
   - **Variable**: `jwt_token`
   - **Initial Value**: (pega el token aquí)
   - **Current Value**: (pega el token aquí)
4. Save

### Opción B: Reemplazar Manualmente

En cada request que uses, ve a la pestaña **Authorization**:
- Type: Bearer Token
- Token: (pega tu token aquí)

## Paso 3: Usar las Requests

Ahora todas las requests funcionarán automáticamente con el token:

- ✅ Crear Periodo Académico
- ✅ Crear Sílabo
- ✅ Subir Excel
- ✅ Listar Sílabos
- ✅ etc.

## Notas Importantes

⏰ **El token expira en 24 horas**
- Si recibes error 401, haz login nuevamente
- Copia el nuevo token

🔄 **Cambiar de usuario**
- Haz login con otro usuario (profesor o coordinador)
- Actualiza la variable `jwt_token` con el nuevo token

## Ejemplo Completo

```bash
# 1. Login como coordinador
POST /api/auth/login
{
  "username": "rescobedo@ulasalle.edu.pe",
  "password": "123"
}

# Respuesta: token = "eyJhbGci..."

# 2. Crear periodo académico (usa el token)
POST /api/academic-periods
Authorization: Bearer eyJhbGci...
{
  "name": "2025-I",
  "startDate": "2025-03-01",
  "endDate": "2025-07-31"
}

# 3. Crear sílabo (usa el mismo token)
POST /api/syllabi
Authorization: Bearer eyJhbGci...
{
  "professorEmail": "vmachacaa@ulasalle.edu.pe",
  "academicPeriodId": 1,
  "courseName": "Arquitectura de Software",
  "courseCode": "SIS501"
}
```

## Troubleshooting

### Error 401 Unauthorized
- ✅ Verifica que copiaste el token completo
- ✅ Verifica que el token no haya expirado (24h)
- ✅ Haz login nuevamente

### Error 403 Forbidden
- ✅ Verifica que el usuario tenga el rol correcto
- ✅ Coordinadores pueden crear periodos y sílabos
- ✅ Profesores solo pueden ver sus sílabos

### Token no funciona
- ✅ Asegúrate de usar "Bearer " antes del token
- ✅ No incluyas comillas en el token
- ✅ Formato correcto: `Authorization: Bearer eyJhbGci...`
