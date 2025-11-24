# Guía de Dockerización: Pokedex Angular App

**Para Estudiantes de Ingeniería de Sistemas**

Esta guía detalla el proceso técnico para contenerizar (dockerizar) una aplicación Angular, cumpliendo con estándares de calidad de software **ISO 25010** como eficiencia de desempeño, seguridad y mantenibilidad.

---

## 1. Preparación del Entorno

Antes de crear el contenedor, debemos preparar nuestro proyecto para asegurar que la imagen sea ligera y segura.

### 1.1. Archivo `.dockerignore`

**Propósito:** Evitar que archivos innecesarios o sensibles se copien al contenedor. Esto reduce el tamaño de la imagen y acelera el proceso de construcción (build).

- **Ubicación:** Raíz del proyecto.
- **Contenido Clave:** `node_modules`, `.git`, `dist`, archivos `.env`.

### 1.2. Configuración de Nginx (`nginx.conf`)

**Propósito:** Servidor web de alto rendimiento para entregar nuestra aplicación estática.
**Optimizaciones ISO 25010:**

- **Gzip:** Compresión habilitada para reducir el consumo de ancho de banda (Eficiencia).
- **Security Headers:** Cabeceras como `X-Frame-Options` para prevenir ataques (Seguridad).
- **SPA Routing:** `try_files $uri $uri/ /index.html;` asegura que Angular maneje las rutas y no Nginx devuelva 404.

---

## 2. El Dockerfile (Multi-stage Build)

Utilizamos una estrategia de **Multi-stage build** para separar el entorno de compilación (pesado) del entorno de ejecución (ligero).

### Etapa 1: Build

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
```

- `FROM node:22-alpine`: Usa una imagen base mínima de Linux (Alpine) con Node.js.
- `npm install`: Instala las dependencias del proyecto. Usamos `install` en lugar de `ci` para asegurar compatibilidad si el `package-lock.json` no está perfectamente sincronizado.

### Etapa 2: Production

```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/pokedex-app/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- `COPY --from=build`: La magia del multi-stage. Solo copiamos los archivos compilados (`dist`) de la etapa anterior. Desechamos todo el entorno de Node.js y `node_modules`, resultando en una imagen final muy pequeña (aprox. 20-30MB vs >500MB).

---

## 3. Orquestación con Docker Compose

El archivo `docker-compose.yml` simplifica la ejecución. En lugar de recordar largos comandos de Docker, definimos la infraestructura como código.

---

## 4. Comandos de Despliegue (Paso a Paso)

A continuación, los comandos necesarios para construir y ejecutar el contenedor, con la explicación detallada de cada flag.

### Paso 4.1: Construir la Imagen

```powershell
docker build -t pokedex-app:1.0.0 .
```

**Desglose del comando:**

- `docker build`: Inicia el proceso de construcción de una imagen.
- `-t pokedex-app:1.0.0`: (Tag) Etiqueta la imagen con un nombre (`pokedex-app`) y una versión (`1.0.0`). Es buena práctica versionar en lugar de usar siempre `latest`.
- `.`: (Contexto) Indica a Docker que busque el `Dockerfile` y los archivos en el directorio actual.

### Paso 4.2: Ejecutar el Contenedor (Manual)

Si no usamos Docker Compose, este sería el comando:

```powershell
docker run -d -p 8080:80 --name pokedex-demo --restart always pokedex-app:1.0.0
```

**Desglose del comando:**

- `docker run`: Crea e inicia un contenedor.
- `-d`: (Detached) Ejecuta el contenedor en segundo plano. La terminal queda libre.
- `-p 8080:80`: (Publish) Mapea el puerto **8080** de tu máquina (host) al puerto **80** del contenedor.
  - Accederás en: `http://localhost:8080`
- `--name pokedex-demo`: Asigna un nombre legible al contenedor para administrarlo fácilmente (logs, stop, rm).
- `--restart always`: Política de reinicio. Si el contenedor falla o Docker se reinicia, el contenedor volverá a arrancar automáticamente (Resiliencia).
- `pokedex-app:1.0.0`: La imagen a utilizar.

### Paso 4.3: Ejecutar con Docker Compose (Recomendado)

```powershell
docker-compose up -d --build
```

**Desglose del comando:**

- `docker-compose up`: Levanta los servicios definidos en `docker-compose.yml`.
- `-d`: (Detached) Ejecución en segundo plano.
- `--build`: Fuerza la reconstrucción de la imagen antes de iniciar. Útil si hiciste cambios en el código.

---

## 5. Verificación y Mantenimiento

### Ver Logs

```powershell
docker logs -f pokedex-demo
```

- `-f`: (Follow) Sigue la salida de los logs en tiempo real (como `tail -f`).

### Detener el Contenedor

```powershell
docker stop pokedex-demo
```

### Escaneo de Vulnerabilidades (Seguridad)

```powershell
docker scan pokedex-app:1.0.0
```

- Analiza la imagen en busca de vulnerabilidades conocidas en las dependencias del sistema operativo y paquetes.

---

**Conclusión:**
Siguiendo este plan, hemos transformado una aplicación Angular en un artefacto inmutable, seguro y altamente eficiente, listo para ser desplegado en cualquier servidor o nube que soporte Docker.
