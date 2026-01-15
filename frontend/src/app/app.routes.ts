import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
    {
        path: '',
        loadComponent: () => import('./core/layout/layout.component').then(m => m.LayoutComponent),
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'inventory', loadComponent: () => import('./features/inventory/inventory.component').then(m => m.InventoryComponent) },
            { path: 'movements', loadComponent: () => import('./features/movements/movements.component').then(m => m.MovementsComponent) },
            { path: 'suppliers', loadComponent: () => import('./features/suppliers/suppliers.component').then(m => m.SuppliersComponent) },
            { path: 'reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
