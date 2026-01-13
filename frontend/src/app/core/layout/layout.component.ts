import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, ButtonModule, MenuModule],
  template: `
    <div class="layout-wrapper">
      <div class="layout-sidebar">
        <div class="logo">
          <h2>Nexus ERP</h2>
        </div>
        <p-menu [model]="items" styleClass="w-full border-none"></p-menu>
      </div>
      <div class="layout-main">
        <div class="layout-topbar">
          <p-button icon="pi pi-bars" styleClass="p-button-text"></p-button>
          <div class="user-profile">
            <span>Admin User</span>
            <i class="pi pi-user" style="margin-left: 10px;"></i>
          </div>
        </div>
        <div class="layout-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    .layout-sidebar {
      width: 250px;
      background-color: var(--surface-card);
      border-right: 1px solid var(--surface-border);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .layout-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--surface-ground);
      overflow: hidden;
    }
    .layout-topbar {
      height: 60px;
      background-color: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      flex-shrink: 0;
    }
    .layout-content {
      padding: 2rem;
      overflow-y: auto;
      flex: 1;
    }
    .logo {
      margin-bottom: 2rem;
      text-align: center;
      color: var(--primary-color);
      h2 {
        margin: 0;
        font-size: 1.5rem;
      }
    }
  `]
})
export class LayoutComponent {
  items: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'Usuarios', icon: 'pi pi-users', routerLink: '/users' },
    { label: 'Productos', icon: 'pi pi-box', routerLink: '/products' },
    { label: 'Inventario', icon: 'pi pi-list', routerLink: '/inventory' }
  ];
}
