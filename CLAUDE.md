# Nexus ERP

Sistema ERP de gestion de inventario. Proyecto de portfolio para demostrar conocimientos full-stack.

## Tech Stack

### Frontend
- **Angular 21** (Standalone Components, lazy-loaded routes)
- **PrimeNG 21** + PrimeIcons para UI
- **Vitest** para testing
- **SCSS** con CSS Variables (soporte light/dark mode)
- **TypeScript 5.9**
- Servido en produccion con **Nginx Alpine** (SPA routing via `try_files`)

### Backend
- **NestJS 11** (Node 20)
- **Prisma 5.22** como ORM
- **PostgreSQL 15** como base de datos
- **JWT** (Passport) para autenticacion
- **bcrypt** para hash de passwords
- **class-validator** + **class-transformer** para validacion de DTOs
- **Swagger** para documentacion de API

### Infraestructura
- **Docker** con multi-stage builds para frontend y backend
- **docker-compose** para desarrollo local (PostgreSQL + pgAdmin)
- VPS con Docker para produccion
- Configuracion dinamica del frontend via `envsubst` en el contenedor Nginx

## Estructura del Proyecto

```
/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── auth/               # JWT auth, Passport strategies
│   │   ├── users/              # Gestion de usuarios
│   │   ├── products/           # CRUD de productos
│   │   ├── categories/         # CRUD de categorias
│   │   ├── inventory/          # Movimientos de stock
│   │   ├── suppliers/          # Gestion de proveedores
│   │   ├── dashboard/          # Metricas y analytics
│   │   ├── prisma/             # Servicio Prisma (DB layer)
│   │   ├── app.module.ts       # Root module
│   │   └── main.ts             # Bootstrap
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos de datos
│   │   ├── seed.ts             # Datos de demostracion
│   │   └── migrations/         # Migraciones SQL
│   ├── Dockerfile              # Multi-stage build (builder + node:20-alpine)
│   └── .env.example            # Template de variables de entorno
│
├── frontend/                   # SPA Angular
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── auth/           # Auth guard
│   │   │   ├── layout/         # Layout principal
│   │   │   └── services/       # Servicios compartidos, config
│   │   └── features/
│   │       ├── auth/           # Login
│   │       ├── dashboard/      # Dashboard principal
│   │       ├── inventory/      # Gestion de inventario
│   │       ├── movements/      # Movimientos de stock
│   │       ├── suppliers/      # Proveedores
│   │       └── reports/        # Reportes
│   ├── public/assets/
│   │   ├── config.json             # Config local (apiUrl, portfolioUrl)
│   │   └── config.template.json    # Template para envsubst en Docker
│   ├── nginx.conf              # Config Nginx para SPA
│   └── Dockerfile              # Multi-stage build (builder + nginx:alpine)
│
└── docker-compose.yml          # Dev: PostgreSQL 15 + pgAdmin
```

## Base de Datos

### Modelos Prisma

| Modelo         | Descripcion                                |
|----------------|--------------------------------------------|
| User           | Usuarios con roles (ADMIN, STAFF, TECH)    |
| Category       | Categorias de productos                    |
| Product        | Productos con SKU, precio, stock           |
| Supplier       | Proveedores                                |
| StockMovement  | Movimientos de entrada/salida de stock     |

### Relaciones
- Product -> Category (many-to-one)
- Product -> Supplier (many-to-one, opcional)
- StockMovement -> Product (many-to-one)
- StockMovement -> User (many-to-one)

### Enums
- `Role`: ADMIN, STAFF, TECH
- `MovementType`: IN, OUT

## Comandos

### Desarrollo local
```bash
# Levantar PostgreSQL + pgAdmin
docker compose up -d

# Backend
cd backend && npm install
npx prisma migrate dev          # Aplicar migraciones
npx prisma db seed              # Seed de datos demo
npm run start:dev               # Dev server en :3000

# Frontend
cd frontend && npm install
npm start                       # Dev server en :4200
```

### Produccion (Docker)
```bash
# Backend
docker build -t nexus-backend ./backend
docker run -e DATABASE_URL="..." -e JWT_SECRET="..." -e CORS_ORIGIN="..." -p 3000:3000 nexus-backend

# Frontend
docker build -t nexus-frontend ./frontend
docker run -e API_URL="..." -e PORTFOLIO_URL="..." -p 80:80 nexus-frontend
```

### Prisma
```bash
npx prisma migrate dev          # Crear/aplicar migracion en dev
npx prisma migrate deploy       # Aplicar migraciones en produccion
npx prisma db seed              # Ejecutar seed
npx prisma generate             # Regenerar client
npx prisma studio               # GUI para explorar datos
```

## Variables de Entorno

### Backend (.env)
| Variable       | Descripcion                          | Ejemplo dev                                              |
|----------------|--------------------------------------|----------------------------------------------------------|
| DATABASE_URL   | Connection string PostgreSQL         | postgresql://admin:password@localhost:5438/nexus_db       |
| DIRECT_URL     | Conexion directa (sin pooler)        | (mismo que DATABASE_URL en local)                        |
| JWT_SECRET     | Clave secreta para tokens JWT        | nexus-erp-super-secret-jwt-key-change-in-production      |
| CORS_ORIGIN    | Origen permitido para CORS           | http://localhost:4200                                    |
| PORT           | Puerto del servidor                  | 3000                                                     |

### Frontend (config.json / envsubst)
| Variable       | Descripcion                          | Ejemplo dev                |
|----------------|--------------------------------------|----------------------------|
| API_URL        | URL de la API backend                | http://localhost:3000      |
| PORTFOLIO_URL  | URL del portfolio del autor          | https://diego-rodriguez.es |

## Credenciales Demo (Seed)
- **Admin**: admin@nexuserp.com / admin123
- **Staff**: almacen@nexuserp.com / staff123

## Rutas Frontend
| Ruta          | Componente          | Auth |
|---------------|---------------------|------|
| /login        | LoginComponent      | No   |
| /dashboard    | DashboardComponent  | Si   |
| /inventory    | InventoryComponent  | Si   |
| /movements    | MovementsComponent  | Si   |
| /suppliers    | SuppliersComponent  | Si   |
| /reports      | ReportsComponent    | Si   |

## Notas Importantes
- El backend usa binary targets para Prisma: `native` + `linux-musl-openssl-3.0.x` (para Alpine en Docker)
- El frontend usa configuracion dinamica: `config.template.json` se procesa con `envsubst` al arrancar el contenedor Nginx
- El docker-compose.yml actual es solo para desarrollo (PostgreSQL en :5438, pgAdmin en :5050)
- No existe docker-compose de produccion todavia — los servicios se despliegan como contenedores individuales
- La base de datos estaba anteriormente en Supabase (eliminada por inactividad)
