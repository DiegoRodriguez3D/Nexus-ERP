import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats, LowStockProduct } from '../../core/services/dashboard.service';
import { ApiService, StockMovement } from '../../core/services/api.service';
import { ProductService } from '../../core/services/product.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="reports">
      <div class="page-header">
        <h1>{{ i18n.currentLang() === 'es' ? 'Informes' : 'Reports' }}</h1>
      </div>

      <div class="loading" *ngIf="loading"><i class="pi pi-spin pi-spinner"></i></div>

      <div class="reports-content" *ngIf="!loading">
        <!-- Summary Cards -->
        <div class="summary-grid">
          <div class="summary-card card">
            <div class="summary-icon"><i class="pi pi-box"></i></div>
            <div class="summary-data">
              <span class="summary-value">{{ totalProducts }}</span>
              <span class="summary-label">{{ i18n.currentLang() === 'es' ? 'Total Productos' : 'Total Products' }}</span>
            </div>
          </div>
          <div class="summary-card card">
            <div class="summary-icon warning"><i class="pi pi-exclamation-triangle"></i></div>
            <div class="summary-data">
              <span class="summary-value">{{ lowStockCount }}</span>
              <span class="summary-label">{{ i18n.currentLang() === 'es' ? 'Stock Bajo' : 'Low Stock' }}</span>
            </div>
          </div>
          <div class="summary-card card">
            <div class="summary-icon success"><i class="pi pi-euro"></i></div>
            <div class="summary-data">
              <span class="summary-value">€{{ formatNumber(totalValue) }}</span>
              <span class="summary-label">{{ i18n.currentLang() === 'es' ? 'Valor Total' : 'Total Value' }}</span>
            </div>
          </div>
          <div class="summary-card card">
            <div class="summary-icon info"><i class="pi pi-arrows-h"></i></div>
            <div class="summary-data">
              <span class="summary-value">{{ totalMovements }}</span>
              <span class="summary-label">{{ i18n.currentLang() === 'es' ? 'Movimientos' : 'Movements' }}</span>
            </div>
          </div>
        </div>

        <div class="reports-grid">
          <!-- Low Stock Report -->
          <div class="report-card card">
            <h3><i class="pi pi-exclamation-circle"></i> {{ i18n.currentLang() === 'es' ? 'Productos con Stock Bajo' : 'Low Stock Products' }}</h3>
            <table class="mini-table">
              <thead>
                <tr>
                  <th>{{ i18n.currentLang() === 'es' ? 'Producto' : 'Product' }}</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of lowStockProducts">
                  <td>{{ p.name }}</td>
                  <td class="stock-low">{{ p.stock }}</td>
                </tr>
                <tr *ngIf="lowStockProducts.length === 0">
                  <td colspan="2" class="empty">{{ i18n.currentLang() === 'es' ? 'Sin alertas' : 'No alerts' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Recent Activity -->
          <div class="report-card card">
            <h3><i class="pi pi-clock"></i> {{ i18n.currentLang() === 'es' ? 'Actividad Reciente' : 'Recent Activity' }}</h3>
            <div class="activity-list">
              <div class="activity-item" *ngFor="let mov of recentMovements.slice(0, 8)">
                <span class="activity-type" [class.in]="mov.type === 'IN'" [class.out]="mov.type === 'OUT'">
                  {{ mov.type === 'IN' ? '+' : '-' }}{{ mov.quantity }}
                </span>
                <span class="activity-product">{{ mov.product?.name }}</span>
                <span class="activity-date">{{ formatDate(mov.createdAt) }}</span>
              </div>
              <div class="empty" *ngIf="recentMovements.length === 0">
                {{ i18n.currentLang() === 'es' ? 'Sin actividad' : 'No activity' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .reports { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.75rem; font-weight: 600; }
    .loading { display: flex; justify-content: center; padding: 3rem; color: var(--accent-color); }
    .loading i { font-size: 2rem; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
    .summary-card { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; }
    .summary-icon { width: 48px; height: 48px; background: var(--accent-color); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem; }
    .summary-icon.warning { background: var(--warning-color); }
    .summary-icon.success { background: var(--success-color); }
    .summary-icon.info { background: #8b5cf6; }
    .summary-data { display: flex; flex-direction: column; }
    .summary-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
    .summary-label { font-size: 0.875rem; color: var(--text-muted); }
    .reports-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .report-card h3 { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; margin-bottom: 1rem; color: var(--text-primary); }
    .report-card h3 i { color: var(--accent-color); }
    .mini-table { width: 100%; border-collapse: collapse; }
    .mini-table th { text-align: left; padding: 0.5rem; font-size: 0.75rem; color: var(--text-muted); border-bottom: 1px solid var(--border-color); }
    .mini-table td { padding: 0.5rem; font-size: 0.875rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
    .stock-low { color: var(--danger-color); font-weight: 600; }
    .empty { text-align: center; color: var(--text-muted); padding: 1rem; }
    .activity-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .activity-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; background: var(--bg-hover); border-radius: var(--radius-sm); }
    .activity-type { font-weight: 600; min-width: 50px; }
    .activity-type.in { color: var(--success-color); }
    .activity-type.out { color: var(--danger-color); }
    .activity-product { flex: 1; font-size: 0.875rem; color: var(--text-primary); }
    .activity-date { font-size: 0.75rem; color: var(--text-muted); }
    @media (max-width: 1024px) {
      .summary-grid { grid-template-columns: repeat(2, 1fr); }
      .reports-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ReportsComponent implements OnInit {
    private dashboardService = inject(DashboardService);
    private api = inject(ApiService);
    private productService = inject(ProductService);
    private cdr = inject(ChangeDetectorRef);
    i18n = inject(I18nService);

    loading = true;
    totalProducts = 0;
    lowStockCount = 0;
    totalValue = 0;
    totalMovements = 0;
    lowStockProducts: LowStockProduct[] = [];
    recentMovements: StockMovement[] = [];

    ngOnInit() { this.loadData(); }

    loadData() {
        this.loading = true;
        let loaded = 0;
        const checkLoaded = () => { if (++loaded >= 4) { this.loading = false; this.cdr.detectChanges(); } };

        this.dashboardService.getStats().subscribe({
            next: (data) => { this.totalValue = data.totalStockValue; this.lowStockCount = data.lowStockCount; this.totalProducts = data.totalProducts; checkLoaded(); },
            error: checkLoaded
        });

        this.dashboardService.getLowStockProducts().subscribe({
            next: (data) => { this.lowStockProducts = data; checkLoaded(); },
            error: checkLoaded
        });

        this.api.getMovements().subscribe({
            next: (data) => { this.recentMovements = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); this.totalMovements = data.length; checkLoaded(); },
            error: checkLoaded
        });

        this.productService.getProducts().subscribe({
            next: (data) => { this.totalProducts = data.length; checkLoaded(); },
            error: checkLoaded
        });
    }

    formatNumber(value: number): string {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
        return value.toFixed(2);
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
}
