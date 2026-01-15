# Nexus ERP - Backend

API REST para el sistema ERP de gestión de inventario.

## Tecnologías
- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones
npx prisma migrate deploy

# Cargar datos de muestra
npx prisma db seed

# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Variables de Entorno

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-secret-key"
PORT=3000
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Desarrollo con hot-reload |
| `npm run build` | Compilar para producción |
| `npm run start:prod` | Ejecutar en producción |
| `npx prisma studio` | Interfaz visual de BD |
