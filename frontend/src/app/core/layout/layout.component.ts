import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { I18nService } from '../services/i18n.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

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
            <span>{{ i18n.t('nav.dashboard') }}</span>
          </a>
          <a routerLink="/inventory" routerLinkActive="active" class="nav-item">
            <i class="pi pi-box"></i>
            <span>{{ i18n.t('nav.inventory') }}</span>
          </a>
          <a routerLink="/movements" routerLinkActive="active" class="nav-item">
            <i class="pi pi-arrows-h"></i>
            <span>{{ i18n.t('nav.movements') }}</span>
          </a>
          <a routerLink="/suppliers" routerLinkActive="active" class="nav-item">
            <i class="pi pi-truck"></i>
            <span>{{ i18n.t('nav.suppliers') }}</span>
          </a>
          <a routerLink="/reports" routerLinkActive="active" class="nav-item">
            <i class="pi pi-chart-bar"></i>
            <span>{{ i18n.t('nav.reports') }}</span>
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left"></div>
          <div class="topbar-right">
            <!-- Language Selector -->
            <button class="lang-btn" (click)="i18n.toggleLanguage()">
              {{ i18n.currentLang() === 'es' ? 'ES' : 'EN' }}
            </button>
            <button class="icon-btn" (click)="toggleTheme()">
              <i [class]="themeService.currentTheme() === 'dark' ? 'pi pi-sun' : 'pi pi-moon'"></i>
            </button>
            
            <!-- Settings -->
            <div class="dropdown-container">
              <button class="icon-btn" (click)="toggleSettings($event)">
                <i class="pi pi-cog"></i>
              </button>
              <div class="dropdown" *ngIf="showSettings">
                <div class="dropdown-header">{{ i18n.currentLang() === 'es' ? 'Configuración' : 'Settings' }}</div>
                <div class="dropdown-item" (click)="toggleTheme(); showSettings = false;">
                  <i [class]="themeService.currentTheme() === 'dark' ? 'pi pi-sun' : 'pi pi-moon'"></i>
                  {{ themeService.currentTheme() === 'dark' ? (i18n.currentLang() === 'es' ? 'Tema Claro' : 'Light Theme') : (i18n.currentLang() === 'es' ? 'Tema Oscuro' : 'Dark Theme') }}
                </div>
                <div class="dropdown-item" (click)="i18n.toggleLanguage(); showSettings = false;">
                  <i class="pi pi-globe"></i>
                  {{ i18n.currentLang() === 'es' ? 'Cambiar a Inglés' : 'Switch to Spanish' }}
                </div>
              </div>
            </div>
            
            <!-- Notifications -->
            <div class="dropdown-container">
              <button class="icon-btn" (click)="toggleNotifications($event)">
                <i class="pi pi-bell"></i>
                <span class="notification-badge" *ngIf="notifications.length > 0">{{ notifications.length }}</span>
              </button>
              <div class="dropdown notifications-dropdown" *ngIf="showNotifications">
                <div class="dropdown-header">{{ i18n.currentLang() === 'es' ? 'Notificaciones' : 'Notifications' }}</div>
                <div class="notification-item" *ngFor="let notif of notifications">
                  <i [class]="notif.icon" [style.color]="notif.color"></i>
                  <div class="notification-content">
                    <span class="notification-text">{{ notif.text }}</span>
                    <span class="notification-time">{{ notif.time }}</span>
                  </div>
                </div>
                <div class="dropdown-empty" *ngIf="notifications.length === 0">
                  <i class="pi pi-check-circle"></i>
                  {{ i18n.currentLang() === 'es' ? 'Sin notificaciones' : 'No notifications' }}
                </div>
              </div>
            </div>
            
            <!-- User Menu -->
            <div class="dropdown-container">
              <div class="user-avatar" (click)="toggleUserMenu($event)">
                <img [src]="getAvatarUrl()" alt="User" />
              </div>
              <div class="dropdown" *ngIf="showUserMenu">
                <div class="dropdown-header">{{ getUserEmail() }}</div>
                <div class="dropdown-item" (click)="logout()">
                  <i class="pi pi-sign-out"></i>
                  {{ i18n.t('common.logout') }}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 240px; background: var(--bg-sidebar); display: flex; flex-direction: column; flex-shrink: 0; }
    .sidebar-header { padding: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    .logo { display: flex; align-items: center; gap: 0.75rem; color: white; font-size: 1.25rem; font-weight: 600; }
    .logo i { font-size: 1.5rem; color: var(--accent-color); }
    .sidebar-nav { padding: 1rem; display: flex; flex-direction: column; gap: 0.25rem; }
    .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: var(--text-sidebar); border-radius: var(--radius-md); transition: all 0.2s; font-size: 0.9375rem; }
    .nav-item:hover { background: rgba(255, 255, 255, 0.1); }
    .nav-item.active { background: var(--accent-color); color: white; }
    .nav-item i { font-size: 1.125rem; width: 1.5rem; }
    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-primary); }
    .topbar { height: 64px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; flex-shrink: 0; }
    .topbar-right { display: flex; align-items: center; gap: 0.5rem; }
    .lang-btn { padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); border-radius: var(--radius-md); cursor: pointer; font-weight: 600; font-size: 0.75rem; transition: all 0.2s; }
    .lang-btn:hover { background: var(--accent-color); color: white; border-color: var(--accent-color); }
    .icon-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: var(--text-secondary); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; position: relative; }
    .icon-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
    .notification-badge { position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; background: var(--danger-color); color: white; font-size: 0.625rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .dropdown-container { position: relative; }
    .dropdown { position: absolute; top: 100%; right: 0; margin-top: 0.5rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); min-width: 220px; z-index: 1000; overflow: hidden; }
    .dropdown-header { padding: 1rem; border-bottom: 1px solid var(--border-color); font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
    .dropdown-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: var(--text-primary); font-size: 0.875rem; cursor: pointer; transition: background 0.2s; }
    .dropdown-item:hover { background: var(--bg-hover); }
    .dropdown-item i { width: 1.25rem; color: var(--text-muted); }
    .dropdown-empty { padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.875rem; }
    .dropdown-empty i { display: block; font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--success-color); }
    .notifications-dropdown { min-width: 300px; max-height: 400px; overflow-y: auto; }
    .notification-item { display: flex; align-items: flex-start; gap: 0.75rem; padding: 1rem; border-bottom: 1px solid var(--border-color); }
    .notification-item:last-child { border-bottom: none; }
    .notification-item i { margin-top: 0.125rem; }
    .notification-content { flex: 1; }
    .notification-text { display: block; font-size: 0.875rem; color: var(--text-primary); margin-bottom: 0.25rem; }
    .notification-time { font-size: 0.75rem; color: var(--text-muted); }
    .user-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; cursor: pointer; }
    .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .page-content { flex: 1; padding: 1.5rem; overflow-y: auto; }
  `]
})
export class LayoutComponent {
  themeService = inject(ThemeService);
  i18n = inject(I18nService);
  private authService = inject(AuthService);
  private router = inject(Router);

  showUserMenu = false;
  showSettings = false;
  showNotifications = false;

  notifications = [
    { icon: 'pi pi-exclamation-triangle', color: 'var(--warning-color)', text: 'Stock bajo: Ratón Inalámbrico', time: 'Hace 5 min' },
    { icon: 'pi pi-exclamation-triangle', color: 'var(--warning-color)', text: 'Stock bajo: Archivadores Cartón', time: 'Hace 1 hora' },
    { icon: 'pi pi-check-circle', color: 'var(--success-color)', text: 'Nuevo pedido recibido', time: 'Hace 2 horas' },
  ];

  @HostListener('document:click')
  onDocumentClick() {
    this.showUserMenu = false;
    this.showSettings = false;
    this.showNotifications = false;
  }

  toggleTheme() { this.themeService.toggleTheme(); }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
    this.showSettings = false;
    this.showNotifications = false;
  }

  toggleSettings(event: Event) {
    event.stopPropagation();
    this.showSettings = !this.showSettings;
    this.showUserMenu = false;
    this.showNotifications = false;
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
    this.showSettings = false;
  }

  getUserEmail(): string {
    const user = this.authService.getUser();
    return user?.email || 'Usuario';
  }

  getAvatarUrl(): string {
    const user = this.authService.getUser();
    const name = user?.email?.split('@')[0] || 'User';
    return `https://ui-avatars.com/api/?name=${name}&background=3b82f6&color=fff`;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
