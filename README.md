# SYGSY - Sistema de Gestión de Sílabos

**SYGSY** es una plataforma web moderna para la gestión, creación, revisión y aprobación de sílabos universitarios. Diseñada con un enfoque "Neobrutalista" para una experiencia de usuario clara y eficiente, permite a Coordinadores y Docentes colaborar en tiempo real.

## Créditos

### Autor
*   **Josué Carlos Alberto Ramos Suyoc**

### Docente
*   **Richart Smith Escobedo Quispe**

---

## Características Principales

*   **Roles y Permisos:** Sistema seguro con roles de `COORDINATOR` (Administrador) y `PROFESSOR`.
*   **Gestión de Sílabos:** Flujo de trabajo completo: Creación -> Asignación -> Envío -> Revisión -> Aprobación/Devolución.
*   **Cargas Masivas:** Soporte para crear sílabos masivamente mediante Excel.
*   **Panel de Control:** Dashboard interactivo con estadísticas en tiempo real y gráficos neobrutalistas.
*   **Generación de Reportes:** Exportación de sílabos a PDF.
*   **Personalización:** Interfaz adaptada al usuario con saludos personalizados y filtrado de contenido relevante.

## Tecnologías Utilizadas

### Backend
*   **Java 17**
*   **Spring Boot 3.3.0** (Web, Security, Data JPA)
*   **PostgreSQL** (Persistencia de datos)
*   **JWT (JSON Web Tokens)** (Autenticación segura)
*   **Apache POI** (Procesamiento de archivos Excel)
*   **OpenPDF** (Generación de Reportes PDF)
*   **Lombok** (Reducción de código boilerplate)
*   **Spring Security** (Protección de endpoints y CSRF)

### Frontend
*   **React 18** (TypeScript v5)
*   **Vite** (Build tool ultrarrápido)
*   **Tailwind CSS** (Estilos y diseño neobrutalista)
*   **Lucide React** (Iconografía)
*   **Axios** (Cliente HTTP)
*   **React Router Dom** (Navegación SPA)
*   **React Hot Toast** (Notificaciones)

---

## Guía de Despliegue Local

Sigue estos pasos para clonar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos
*   Java JDK 17 o superior.
*   Node.js 18 o superior.
*   PostgreSQL Server (corriendo en puerto 5432).
*   Maven (opcional, si no usas el wrapper `mvnw`).

### 1. Configuración de Base de Datos
Crea una base de datos vacía en PostgreSQL llamada `sygsy_db`:

```sql
CREATE DATABASE sygsy_db;
```

Asegúrate de que tu usuario sea `jcrdev` y contraseña `postgres` (o actualiza `src/main/resources/application.properties` con tus credenciales reales).

### 2. Backend (Spring Boot)
1.  Navega a la carpeta raíz del proyecto.
2.  Ejecuta el servidor:

```bash
mvn spring-boot:run
```
*El servidor iniciará en `http://localhost:8080`.*

### 3. Frontend (React)
1.  Abre una nueva terminal y navega a la carpeta `frontend`:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
*La aplicación estará disponible en `http://localhost:5173`.*

---

## Datos de Prueba (Seed)

El sistema incluye un script en Python (`generate_3_careers.py`) para poblar la base de datos con usuarios, carreras y sílabos de prueba.

1.  Asegúrate de tener `requests` instalado en Python:
    ```bash
    pip install requests
    ```
2.  Ejecuta el script (con el backend corriendo):
    ```bash
    python3 generate_3_careers.py
    ```

### Credenciales por Defecto
Una vez ejecutado el script, puedes acceder con:

*   **Coordinador General:** `admin` / `password`
*   **Coordinador (Industrial):** `coord_industrial` / `password`
*   **Docente:** `maramayov@ulasalle.edu.pe` / `password`

---

## Estructura del Proyecto

*   `/src`: Código fuente del Backend (Java/Spring).
*   `/frontend`: Código fuente del Frontend (React/Vite).
*   `/frontend/public`: Assets estáticos (Logos, Favicons).
*   `*.xlsx`: Plantillas y ejemplos para carga masiva de sílabos.
