# Explicación de JWT para tu Profesor 🎓

## ¿Qué es JWT?

**JWT (JSON Web Token)** es un estándar abierto (RFC 7519) para transmitir información de forma segura entre dos partes como un objeto JSON. Es una forma de autenticación **sin estado (stateless)** que no requiere que el servidor guarde sesiones.

## ¿Por qué JWT en lugar de Basic Auth?

### Basic Auth (Lo que teníamos antes)
```
Cliente                    Servidor
   |                          |
   | Username + Password      |
   | (en CADA request)        |
   |------------------------->|
   |                          | Valida en BD
   |                          | cada vez
```

**Problemas:**
- ❌ Envía credenciales en cada request
- ❌ Servidor debe consultar BD en cada request
- ❌ No escala bien con múltiples servidores
- ❌ Difícil de usar en aplicaciones móviles

### JWT (Lo que tenemos ahora)
```
Cliente                    Servidor
   |                          |
   | 1. Login (una vez)       |
   |------------------------->|
   |                          | Valida credenciales
   |                          | Genera token JWT
   | 2. Token JWT             |
   |<-------------------------|
   |                          |
   | 3. Requests con token    |
   |------------------------->|
   |                          | Valida token
   |                          | (sin consultar BD)
```

**Ventajas:**
- ✅ Credenciales solo se envían una vez
- ✅ Token se valida sin consultar BD
- ✅ Funciona con múltiples servidores
- ✅ Perfecto para móviles y SPAs

---

## Estructura de un Token JWT

Un JWT tiene 3 partes separadas por puntos (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJlc2NvYmVkb0B1bGFzYWxsZS5lZHUucGUiLCJyb2xlIjoiQ09PUkRJTkFUT1IiLCJleHAiOjE3MDA4NjQwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
└────────────── HEADER ──────────────┘ └──────────────────── PAYLOAD ────────────────────┘ └────────── SIGNATURE ────────┘
```

### 1. Header (Encabezado)
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
- `alg`: Algoritmo de firma (HS256 = HMAC-SHA256)
- `typ`: Tipo de token (JWT)

### 2. Payload (Datos)
```json
{
  "username": "rescobedo@ulasalle.edu.pe",
  "role": "COORDINATOR",
  "exp": 1700864000
}
```
- `username`: Email del usuario
- `role`: Rol (COORDINATOR o PROFESSOR)
- `exp`: Fecha de expiración (timestamp Unix)

### 3. Signature (Firma)
```
HMACSHA256(
  base64(header) + "." + base64(payload),
  secret_key
)
```
- Garantiza que el token no ha sido modificado
- Solo el servidor puede crear/validar la firma (tiene la clave secreta)

---

## Flujo Completo de Autenticación

### Paso 1: Login (Obtener Token)

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "rescobedo@ulasalle.edu.pe",
  "password": "123"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "rescobedo@ulasalle.edu.pe",
  "role": "COORDINATOR",
  "expiresIn": 86400
}
```

### Paso 2: Usar Token en Requests

```bash
GET /api/syllabi
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ¿Cómo Funciona Internamente?

### 1. Login (AuthController)

```java
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    // 1. Autenticar usuario con Spring Security
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            request.getUsername(),
            request.getPassword()
        )
    );
    
    // 2. Obtener datos del usuario
    User user = userRepository.findByUsername(request.getUsername())
        .orElseThrow();
    
    // 3. Generar token JWT
    String token = jwtUtil.generateToken(
        user.getUsername(), 
        user.getRole().name()
    );
    
    // 4. Devolver token al cliente
    return ResponseEntity.ok(LoginResponse.builder()
        .token(token)
        .username(user.getUsername())
        .role(user.getRole().name())
        .expiresIn(86400)
        .build());
}
```

### 2. Generación del Token (JwtUtil)

```java
public String generateToken(String username, String role) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", role);
    
    return Jwts.builder()
        .setClaims(claims)              // Datos del usuario
        .setSubject(username)            // Username
        .setIssuedAt(new Date())         // Fecha de creación
        .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24h
        .signWith(secretKey, HS256)      // Firma con clave secreta
        .compact();                      // Genera el string final
}
```

### 3. Validación en Cada Request (JwtAuthenticationFilter)

```java
@Override
protected void doFilterInternal(HttpServletRequest request, ...) {
    // 1. Extraer token del header "Authorization: Bearer <token>"
    String authHeader = request.getHeader("Authorization");
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        
        // 2. Extraer username del token
        String username = jwtUtil.extractUsername(token);
        
        // 3. Validar token
        if (jwtUtil.validateToken(token, username)) {
            // 4. Cargar detalles del usuario
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            // 5. Establecer autenticación en SecurityContext
            UsernamePasswordAuthenticationToken auth = 
                new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
                );
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
    }
    
    // 6. Continuar con el request
    filterChain.doFilter(request, response);
}
```

---

## Seguridad del JWT

### 1. Clave Secreta
```properties
jwt.secret=sygsy-secret-key-for-jwt-token-generation...
```
- **Crítico**: Solo el servidor conoce esta clave
- Usada para firmar y validar tokens
- Debe ser larga y aleatoria (mínimo 256 bits)

### 2. Expiración
```properties
jwt.expiration=86400000  # 24 horas en milisegundos
```
- Tokens expiran después de 24 horas
- Previene uso indefinido de tokens robados
- Usuario debe hacer login nuevamente

### 3. Validación
```java
public Boolean validateToken(String token, String username) {
    String extractedUsername = extractUsername(token);
    return (extractedUsername.equals(username) && !isTokenExpired(token));
}
```
- Verifica que el username coincida
- Verifica que no haya expirado
- Verifica la firma (automático en `extractUsername`)

---

## Ventajas de Nuestra Implementación

### 1. Stateless (Sin Estado)
- ✅ Servidor no guarda sesiones
- ✅ Escala horizontalmente (múltiples servidores)
- ✅ Menos carga en base de datos

### 2. Seguro
- ✅ Token firmado criptográficamente
- ✅ No se pueden modificar sin detectar
- ✅ Expiran automáticamente

### 3. Flexible
- ✅ Funciona con web, móvil, APIs
- ✅ Fácil de usar con frameworks frontend (React, Angular, etc.)
- ✅ Estándar de la industria

### 4. Información en el Token
- ✅ Username y role incluidos
- ✅ No necesita consultar BD para saber quién es el usuario
- ✅ Más rápido que Basic Auth

---

## Comparación: Basic Auth vs JWT

| Aspecto | Basic Auth | JWT |
|---------|-----------|-----|
| **Credenciales** | En cada request | Solo en login |
| **Consultas BD** | En cada request | Solo en login |
| **Escalabilidad** | Difícil | Excelente |
| **Móviles** | Incómodo | Perfecto |
| **Expiración** | No | Sí (configurable) |
| **Estado** | Stateful | Stateless |
| **Seguridad** | Menos seguro | Más seguro |

---

## Ejemplo Práctico Completo

### 1. Usuario hace login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "rescobedo@ulasalle.edu.pe",
    "password": "123"
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQ09PUkRJTkFUT1IiLCJzdWIiOiJyZXNjb2JlZG9AdWxhc2FsbGUuZWR1LnBlIiwiaWF0IjoxNzAwODYwMDAwLCJleHAiOjE3MDA5NDY0MDB9.signature",
  "username": "rescobedo@ulasalle.edu.pe",
  "role": "COORDINATOR",
  "expiresIn": 86400
}
```

### 2. Usuario guarda el token
El cliente (navegador, app móvil) guarda el token en memoria o localStorage.

### 3. Usuario hace requests con el token
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  http://localhost:8080/api/syllabi
```

### 4. Servidor valida y responde
- Extrae el token del header
- Valida la firma
- Verifica que no haya expirado
- Extrae username y role
- Procesa el request
- Devuelve la respuesta

---

## Puntos Clave para Explicar al Profesor

1. **JWT es un estándar de la industria** - No es algo inventado, es RFC 7519
2. **Stateless = Escalable** - No guardamos sesiones, podemos tener múltiples servidores
3. **Más seguro que Basic Auth** - Credenciales solo se envían una vez
4. **Token firmado** - No se puede modificar sin que lo detectemos
5. **Expira automáticamente** - Seguridad adicional
6. **Fácil de usar** - Cliente solo necesita incluir el token en el header
7. **Estándar para APIs modernas** - Usado por Google, Facebook, Twitter, etc.

---

## Resumen en 3 Puntos

1. **Login una vez** → Obtienes un token JWT
2. **Token en cada request** → Servidor valida sin consultar BD
3. **Token expira** → Usuario debe hacer login nuevamente

¡Es simple, seguro y escalable! 🚀
