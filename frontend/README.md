# Nexus ERP - Frontend

Interfaz de usuario Angular para el sistema ERP.

## Tecnologías
- Angular 19
- PrimeNG / PrimeIcons
- CSS Variables (Theming)
- RxJS

## Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm start

# Producción
npm run build
```

## Configuración

Editar `src/environments/environment.ts` para cambiar la URL del API:

```typescript
export const environment = {
  apiUrl: 'http://localhost:3000'
};
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run watch` | Build en modo watch |
