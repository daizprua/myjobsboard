# MEMORÁNDUM DE CONTEXTO Y MEMORIA DEL PROYECTO 🧠

Este archivo es la **fuente de verdad absoluta y memoria persistente** del proyecto **MyJobsBoard**. Su propósito es garantizar que cualquier Inteligencia Artificial (LLM) o desarrollador que trabaje en esta base de código comprenda instantáneamente el estado actual del proyecto, las decisiones de diseño arquitectónico y las reglas estrictas de implementación.

> [!IMPORTANT]
> **INSTRUCCIONES PARA OTROS LLM**: 
> 1. **LEER PRIMERO**: Siempre lee este archivo antes de realizar cualquier cambio, agregar código o proponer modificaciones.
> 2. **MANTENER EL REGISTRO**: Cada vez que implementes una nueva funcionalidad, crees un archivo o modifiques una ruta, **debes actualizar este memorándum** en las secciones correspondientes ("Estado de la Implementación" y "Registro de Archivos").
> 3. **RESPETAR EL DISEÑO**: No introduzcas TailwindCSS ni estilos púrpura/morado de IA estándar. Mantén la paleta de diseño unificada de **Apple Minimalist** detallada abajo.

---

## 🎨 Sistema de Diseño: Apple Minimalist (100% Cohesivo)

Todas las interfaces (tanto privadas como públicas) deben seguir rigurosamente estas variables CSS definidas en el elemento raíz (`:root`). No se admiten desviaciones de color para garantizar la sobriedad y profesionalismo.

*   **Gris Claro Apple (`--bg-main`)**: `#f5f5f7` (Fondo general del cuerpo).
*   **Blanco Puro (`--bg-card`)**: `#ffffff` (Fondo de tarjetas, paneles y contenedores).
*   **Bordes Refinados (`--border-light`)**: `#d2d2d7` (Bordes delgados de 1px).
*   **Texto Principal (`--text-main`)**: `#1d1d1f` (Carbón profundo ultra-legible).
*   **Texto Secundario (`--text-muted`)**: `#86868b` (Gris medio apagado).
*   **Acento Unificado (`--color-accent`)**: **Azul Apple (`#0071e3`)** (El ÚNICO color de resalte en botones, enlaces, focos de entrada y barras de afinidad).
*   **Verde iOS (`--color-success`)**: `#34c759` (Utilizado exclusivamente para éxitos y coincidencias positivas).
*   **Redondeado de Esquinas (`--border-radius`)**: `12px` (Esquinas suaves características).

---

## 🗄️ Esquema de Base de Datos (Prisma / SQLite)

El esquema Prisma (`prisma/schema.prisma`) utiliza SQLite localmente para que sea ultra-rápido y no consuma recursos de servidor. Los modelos clave son:
*   `Profile`: Datos de contacto del administrador, credenciales SMTP del correo y slug público.
*   `Project`: Lista de proyectos destacados que alimentarán el portafolio/CV público.
*   `Authenticator`: Almacena firmas criptográficas seguras de Face ID / Touch ID mediante la API de **WebAuthn** para logins passwordless en móviles.
*   `Job`: Ofertas de empleo remotas indexadas por el scraper, incluyendo descripción, etiquetas y tasa de afinidad de OpenRouter.
*   `Application`: Historial y estatus de las postulaciones (`Guardado`, `Postulado`, etc.) con notas y capturas de pantalla de Puppeteer.

---

## 📋 Estado de la Implementación (Checklist de Control)

### Fase 1: Cimientos y Configuración Local 🏗️
- [x] Inicializar monorepo, crear `package.json` raíz y estructura de carpetas (`backend/` y `frontend/`)
- [x] Configurar Prisma ORM con el esquema SQLite e inicializar la base de datos local (`npx prisma db push`)
- [x] Crear el servidor Express base con enrutamiento de APIs y soporte CORS

### Fase 2: Servicios de Backend (Scraper, OpenRouter, Puppeteer) ⚙️
- [x] **Módulo Scraper**: Programación de extracción asíncrona en segundo plano desde WeWorkRemotely y RemoteOK.
- [x] **Módulo OpenRouter (`openrouter.js`)**: Cliente de IA para calificar afinidad de vacantes y redactar cartas personalizadas y optimizaciones de LinkedIn.
- [x] **Módulo de Correo (`mail.js`)**: Servicio SMTP con Nodemailer para enviar postulaciones y notificaciones de alta afinidad.
- [x] **Módulo Puppeteer (`puppeteer.js`)**: Automatizador en segundo plano para rellenar entradas de datos básicos y capturar screenshots de éxito.
- [x] **Módulo WebAuthn (`webauthn.js`)**: Rutas de backend para registro y validación criptográfica de Face ID / Touch ID.

### Fase 3: Rutas de la API (Endpoints) 🔌
- [x] Endpoints de Autenticación tradicional y biométrica (WebAuthn).
- [x] Endpoints de Perfil y Proyectos (CRUD).
- [x] Endpoints de Ofertas de Trabajo y Postulaciones (Kanban).
- [x] Endpoints de generación asistida con OpenRouter.

### Fase 4: Frontend Responsivo (React + Vite) 🎨
- [x] Inicializar la SPA en `frontend/` y configurar el sistema de diseño en `index.css` (Apple Minimalist).
- [x] Pantalla de Inicio de Sesión (`Login.jsx`) con soporte para credenciales tradicionales e inicio biométrico táctil/facial instantáneo.
- **Sección Privada (Administrador)**:
  - [x] Dashboard Principal (`Dashboard.jsx`): Estadísticas en gris/blanco y gráficos en azul Apple.
  - [x] Tablero Kanban (`Kanban.jsx`): Tablero táctil adaptativo en grid.
  - [x] Buscador de Empleos (`JobsList.jsx`): Explorador con acentos de azul corporativo y porcentajes de coincidencia.
  - [x] Consola de Perfil (`Profile.jsx`): Edición de CV, portafolio y subsección **LinkedIn Profile Optimizer**.
- **Sección Pública**:
  - [x] CV Interactivo Compartible (`PublicCV.jsx`): Vista `/cv/fullstack` espectacular y optimizada para captar reclutadores.

### Fase 5: Dockerización y Dokploy 🚀
- [x] Crear `Dockerfile` optimizado (NodeJS + Chrome dependencies para Puppeteer).
- [x] Crear `docker-compose.yml` para despliegue automático en Dokploy.
- [x] Compilación y empaquetado de producción exitoso.

---

## 📁 Registro de Archivos Creados/Modificados

*(Esta sección debe ser actualizada por los LLM a medida que agreguen o editen archivos en el proyecto)*

| Ruta del Archivo | Estado | Propósito |
| :--- | :--- | :--- |
| `CONTEXT_MEMORANDUM.md` | **CREADO** | Memoria persistente del proyecto y guía para LLMs. |
| `package.json` | **CREADO** | Dependencias base del proyecto y scripts de inicio. |
| `prisma/schema.prisma` | **CREADO** | Esquema de la base de datos (Profile, Job, Application, Authenticator). |
| `prisma/dev.db` | **GENERADO** | Base de datos local instanciada mediante Prisma. |
| `backend/index.js` | **CREADO** | Servidor base de Express con CORS configurado. |
| `backend/services/scraper.js` | **CREADO** | Scraper de WeWorkRemotely y RemoteOK, inserta en Prisma. |
| `backend/services/openrouter.js`| **CREADO** | Integración con OpenRouter API (Afinidad, CV, LinkedIn). |
| `backend/services/mail.js` | **CREADO** | Servicio Nodemailer para postulaciones por email. |
| `backend/services/puppeteer.js` | **CREADO** | Automatizador de Chromium para formularios de empleo. |
| `backend/routes/webauthn.js` | **CREADO** | Rutas Express para registro y login biométrico (WebAuthn). |
| `backend/routes/auth.js` | **CREADO** | Endpoints para inicio de sesión tradicional y perfiles iniciales. |
| `backend/routes/profile.js` | **CREADO** | Endpoints CRUD de Perfil de usuario y Portafolio de proyectos. |
| `backend/routes/jobs.js` | **CREADO** | Endpoints de búsqueda de empleos y gestión del estado Kanban. |
| `backend/routes/ai.js` | **CREADO** | Endpoints que conectan la UI con OpenRouter y automatizaciones. |
| `frontend/src/index.css` | **CREADO** | Sistema de diseño Apple Minimalist (Gris, Blanco, Azul Corporativo). |
| `frontend/src/App.jsx` | **CREADO** | Enrutador principal de React y Layout con React Router Dom. |
| `frontend/src/components/Sidebar.jsx`| **CREADO** | Barra de navegación principal con iconos Lucide. |
| `frontend/src/pages/Login.jsx` | **CREADO** | Interfaz de inicio de sesión híbrido (WebAuthn / Email). |
| `frontend/src/pages/Dashboard.jsx` | **CREADO** | Panel de métricas y resumen de productividad. |
| `frontend/src/pages/Kanban.jsx` | **CREADO** | Tablero visual para seguimiento de ofertas por estado. |
| `frontend/src/pages/JobsList.jsx` | **CREADO** | Interfaz del explorador con afinidad AI y botón de postulación. |
| `frontend/src/pages/Profile.jsx` | **CREADO** | Consola doble con optimizador de perfil de LinkedIn AI. |
| `frontend/src/pages/PublicCV.jsx` | **CREADO** | Tarjeta de presentación interactiva, optimizada para reclutadores. |
| `backend/services/linkedin.js` | **CREADO** | Automatizador de Puppeteer que actualiza LinkedIn usando cookies de sesión `li_at`. |
| `Dockerfile` | **CREADO** | Receta para construir un contenedor con NodeJS y Puppeteer. |
| `docker-compose.yml` | **CREADO** | Archivo de orquestación final para despliegue en Dokploy. |

---

## 💡 Guía para el Siguiente LLM / Desarrollador
Cuando continúes con el desarrollo, sigue estos pasos:
1.  **Fase 1**: Crea el `package.json` de la raíz del proyecto e instala las dependencias (`npm install`).
2.  **Base de Datos**: Inicializa Prisma creando la carpeta `prisma/` y el archivo `schema.prisma`. Ejecuta la migración inicial.
3.  **Fase 2**: Implementa la API base y los controladores asíncronos del backend para asegurar que la app se mantenga súper ligera (Scrapers y colas de OpenRouter).
4.  **No improvisar en la UI**: Al crear el CSS del frontend, utiliza única y estrictamente las variables CSS del archivo `CONTEXT_MEMORANDUM.md`.
