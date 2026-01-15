import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <i class="pi pi-box"></i>
            <span>Nexus ERP</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <i class="pi pi-th-large"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="/inventory" routerLinkActive="active" class="nav-item">
            <i class="pi pi-box"></i>
            <span>Inventory</span>
          </a>
          <a routerLink="/movements" routerLinkActive="active" class="nav-item">
            <i class="pi pi-arrows-h"></i>
            <span>Movements</span>
          </a>
          <a routerLink="/suppliers" routerLinkActive="active" class="nav-item">
            <i class="pi pi-truck"></i>
            <span>Suppliers</span>
          </a>
          <a routerLink="/reports" routerLinkActive="active" class="nav-item">
            <i class="pi pi-chart-bar"></i>
            <span>Reports</span>
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <!-- Breadcrumb or page title placeholder -->
          </div>
          <div class="topbar-right">
            <button class="icon-btn" (click)="toggleTheme()">
              <i [class]="themeService.currentTheme() === 'dark' ? 'pi pi-sun' : 'pi pi-moon'"></i>
            </button>
            <button class="icon-btn">
              <i class="pi pi-cog"></i>
            </button>
            <button class="icon-btn">
              <i class="pi pi-bell"></i>
            </button>
            <div class="user-avatar">
              <img src="https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff" alt="User" />
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Sidebar */
    .sidebar {
      width: 240px;
      background: var(--bg-sidebar);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .logo i {
      font-size: 1.5rem;
      color: var(--accent-color);
    }

    .sidebar-nav {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--text-sidebar);
      border-radius: var(--radius-md);
      transition: all 0.2s;
      font-size: 0.9375rem;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .nav-item.active {
      background: var(--accent-color);
      color: white;
    }

    .nav-item i {
      font-size: 1.125rem;
      width: 1.5rem;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg-primary);
    }

    /* Topbar */
    .topbar {
      height: 64px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      flex-shrink: 0;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .icon-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      margin-left: 0.5rem;
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Page Content */
    .page-content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }
  `]
})
export class LayoutComponent {
  themeService = inject(ThemeService);

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
