# 📦 Nexus ERP

<p align="center">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
</p>

Sistema ERP moderno para gestión de inventario empresarial con soporte multilenguaje (ES/EN) y temas claro/oscuro.

---

## ✨ Características

- 📊 **Dashboard** - Métricas en tiempo real, alertas de stock bajo, gráficas de movimientos
- 📦 **Inventario** - CRUD completo de productos con categorías y proveedores
- 🔄 **Movimientos** - Registro de entradas/salidas con paginación y filtros
- 🏭 **Proveedores** - Gestión completa de proveedores con búsqueda
- 📈 **Informes** - Resumen ejecutivo con exportación CSV
- 🌍 **Multilenguaje** - Español e Inglés
- 🎨 **Temas** - Modo claro y oscuro

---

## 🚀 Demo

### Credenciales de Acceso

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Admin** | `admin@nexuserp.com` | `admin123` |
| **Staff** | `almacen@nexuserp.com` | `staff123` |

---

## 🛠️ Tecnologías

### Frontend
- Angular 19 (Standalone Components)
- PrimeNG / PrimeIcons
- CSS Variables (Theming)
- RxJS

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt

---

## 📁 Estructura del Proyecto

```
nexus-erp/
├── frontend/                 # Angular 19
│   ├── src/app/
│   │   ├── core/            # Layout, Services, Guards
│   │   └── features/        # Dashboard, Inventory, Movements, etc.
│   └── src/styles.scss      # Global styles & theming
├── backend/                  # NestJS
│   ├── src/
│   │   ├── auth/            # JWT Authentication
│   │   ├── users/           # User Management
│   │   ├── products/        # Products CRUD
│   │   ├── categories/      # Categories CRUD
│   │   ├── inventory/       # Stock Movements
│   │   ├── suppliers/       # Suppliers CRUD
│   │   └── dashboard/       # Dashboard Metrics
│   └── prisma/              # Database Schema & Migrations
└── docker-compose.yml        # PostgreSQL & pgAdmin
```

---


## 📝 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Autenticación |
| GET | `/products` | Listar productos |
| POST | `/products` | Crear producto |
| PATCH | `/products/:id` | Actualizar producto |
| DELETE | `/products/:id` | Eliminar producto |
| GET | `/categories` | Listar categorías |
| GET | `/suppliers` | Listar proveedores |
| POST | `/suppliers` | Crear proveedor |
| GET | `/inventory` | Listar movimientos |
| POST | `/inventory` | Crear movimiento |
| GET | `/dashboard/stats` | Métricas dashboard |
| GET | `/dashboard/low-stock` | Productos stock bajo |

---

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  Desarrollado con ❤️ usando Angular + NestJS
</p>
