# ==========================================
# Stage 1: Build (Compilación)
# ==========================================
# Usamos una imagen base de Node.js ligera (alpine) para construir la app.
# 'AS build' nos permite nombrar esta etapa para referenciarla después.
FROM node:22-alpine AS build

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar el caché de Docker
# Si package.json no cambia, Docker no volverá a ejecutar 'npm install'
COPY package*.json ./

# Instalamos las dependencias (usamos install en lugar de ci para evitar errores de sincronización)
RUN npm install

# Copiamos el resto del código fuente de la aplicación
COPY . .

# Ejecutamos el comando de construcción de Angular (producción por defecto)
RUN npm run build

# ==========================================
# Stage 2: Production (Ejecución)
# ==========================================
# Usamos Nginx alpine para servir el contenido estático. Es muy ligero y seguro.
FROM nginx:alpine

# Copiamos la configuración personalizada de Nginx que creamos
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los artefactos compilados desde la etapa 'build'.
# NOTA: Angular 17+ con application builder suele generar una carpeta 'browser'.
# Si la estructura es diferente, ajustar esta ruta: /app/dist/pokedex-app/browser
COPY --from=build /app/dist/pokedex-app/browser /usr/share/nginx/html

# Exponemos el puerto 80 para que sea accesible desde fuera del contenedor
EXPOSE 80

# El comando por defecto de la imagen nginx es iniciar el servidor, 
# así que no necesitamos CMD explícito, pero lo documentamos.
CMD ["nginx", "-g", "daemon off;"]
