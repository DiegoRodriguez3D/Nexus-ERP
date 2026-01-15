import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats, LowStockProduct, ChartData } from '../../core/services/dashboard.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>{{ i18n.t('dashboard.title') }}</h1>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ i18n.t('dashboard.totalStockValue') }}</div>
          <div class="stat-value">
            <span class="amount">€{{ formatNumber(stats?.totalStockValue || 0) }}</span>
            <span class="change positive" *ngIf="stats?.percentageChange">+{{ stats?.percentageChange }}%</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ i18n.t('dashboard.lowStockAlerts') }}</div>
          <div class="stat-value">
            <span class="amount alert-count">{{ stats?.lowStockCount || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Low Stock Alerts List -->
        <div class="card low-stock-card">
          <h3>{{ i18n.t('dashboard.lowStockAlerts') }}</h3>
          <div class="alerts-list">
            <div class="alert-item" *ngFor="let product of lowStockProducts">
              <div class="alert-icon"><i class="pi pi-exclamation-triangle"></i></div>
              <div class="alert-content">
                <span class="alert-name">{{ product.name }}</span>
                <span class="alert-stock">Stock: {{ product.stock }}</span>
              </div>
            </div>
            <div class="no-data" *ngIf="lowStockProducts.length === 0 && !loading">
              <i class="pi pi-check-circle"></i>
              <span>{{ i18n.t('dashboard.noAlerts') }}</span>
            </div>
            <div class="loading" *ngIf="loading"><i class="pi pi-spin pi-spinner"></i></div>
          </div>
        </div>

        <!-- Recent Movements Chart -->
        <div class="card chart-card">
          <h3>{{ i18n.t('dashboard.recentMovements') }}</h3>
          <div class="chart-container">
            <div class="chart-wrapper">
              <!-- Y-axis labels -->
              <div class="y-axis">
                <span *ngFor="let label of yAxisLabels">{{ label }}</span>
              </div>
              <!-- Chart -->
              <svg viewBox="0 0 400 200" class="chart">
                <line *ngFor="let i of [0, 1, 2, 3, 4]" [attr.x1]="0" [attr.y1]="i * 40" [attr.x2]="400" [attr.y2]="i * 40" stroke="var(--border-color)" stroke-width="1"/>
                <polyline fill="none" stroke="var(--accent-color)" stroke-width="2" [attr.points]="getChartPoints()"/>
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:var(--accent-color);stop-opacity:0.3"/>
                    <stop offset="100%" style="stop-color:var(--accent-color);stop-opacity:0"/>
                  </linearGradient>
                </defs>
                <polygon fill="url(#chartGradient)" [attr.points]="getAreaPoints()"/>
                <!-- Data points -->
                <circle *ngFor="let point of chartPoints; let i = index" [attr.cx]="point.x" [attr.cy]="point.y" r="4" fill="var(--accent-color)"/>
              </svg>
            </div>
            <!-- X-axis labels -->
            <div class="chart-labels">
              <span *ngFor="let data of chartData">{{ data.month }}</span>
            </div>
            <!-- Legend -->
            <div class="chart-legend">
              <span class="legend-label">{{ i18n.currentLang() === 'es' ? 'Movimientos por mes' : 'Movements per month' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1400px; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .dashboard-header h1 { font-size: 1.75rem; font-weight: 600; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
    .stat-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; }
    .stat-label { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
    .stat-value { display: flex; align-items: baseline; gap: 0.75rem; }
    .amount { font-size: 2rem; font-weight: 700; color: var(--text-primary); }
    .change { font-size: 0.875rem; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); }
    .change.positive { background: rgba(34, 197, 94, 0.1); color: var(--success-color); }
    .content-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem; }
    .card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }
    .low-stock-card { max-height: 400px; overflow-y: auto; }
    .alerts-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .alert-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--bg-hover); border-radius: var(--radius-md); }
    .alert-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(245, 158, 11, 0.1); color: var(--warning-color); border-radius: var(--radius-sm); }
    .alert-content { flex: 1; display: flex; justify-content: space-between; align-items: center; }
    .alert-name { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
    .alert-stock { font-size: 0.75rem; color: var(--danger-color); font-weight: 600; }
    .no-data { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem; color: var(--text-muted); }
    .no-data i { font-size: 2rem; color: var(--success-color); }
    .loading { display: flex; justify-content: center; padding: 2rem; color: var(--accent-color); }
    .loading i { font-size: 1.5rem; }
    .chart-container { position: relative; }
    .chart-wrapper { display: flex; gap: 0.5rem; }
    .y-axis { display: flex; flex-direction: column; justify-content: space-between; padding: 0 0.5rem 0 0; height: 160px; margin-top: 20px; }
    .y-axis span { font-size: 0.625rem; color: var(--text-muted); text-align: right; min-width: 30px; }
    .chart { flex: 1; height: 200px; }
    .chart-labels { display: flex; justify-content: space-between; padding: 0.5rem 0 0.5rem 40px; font-size: 0.75rem; color: var(--text-muted); }
    .chart-legend { display: flex; justify-content: center; padding: 0.5rem; border-top: 1px solid var(--border-color); margin-top: 0.5rem; }
    .legend-label { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; }
    .legend-label::before { content: ''; width: 12px; height: 3px; background: var(--accent-color); border-radius: 2px; }
    @media (max-width: 1024px) { .stats-grid { grid-template-columns: 1fr; } .content-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);
  i18n = inject(I18nService);

  stats: DashboardStats | null = null;
  lowStockProducts: LowStockProduct[] = [];
  chartData: ChartData[] = [];
  chartPoints: { x: number; y: number }[] = [];
  yAxisLabels: string[] = [];
  loading = true;

  ngOnInit() { this.loadDashboardData(); }

  loadDashboardData() {
    this.loading = true;
    this.dashboardService.getStats().subscribe({
      next: (data) => { this.stats = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading stats:', err)
    });

    this.dashboardService.getLowStockProducts().subscribe({
      next: (data) => { this.lowStockProducts = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });

    this.dashboardService.getMovementsChart().subscribe({
      next: (data) => {
        this.chartData = data.length ? data : this.getMockChartData();
        this.calculateChartPoints();
        this.cdr.detectChanges();
      },
      error: () => { this.chartData = this.getMockChartData(); this.calculateChartPoints(); this.cdr.detectChanges(); }
    });
  }

  formatNumber(value: number): string {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toFixed(2);
  }

  getMockChartData(): ChartData[] {
    return [
      { month: 'Ene', value: 50 }, { month: 'Feb', value: 80 },
      { month: 'Mar', value: 120 }, { month: 'Abr', value: 200 },
      { month: 'May', value: 280 }, { month: 'Jun', value: 320 },
    ];
  }

  calculateChartPoints() {
    if (this.chartData.length === 0) return;
    const maxValue = Math.max(...this.chartData.map(d => d.value), 1);
    const roundedMax = Math.ceil(maxValue / 50) * 50;
    this.yAxisLabels = [roundedMax, roundedMax * 0.75, roundedMax * 0.5, roundedMax * 0.25, 0].map(v => String(Math.round(v)));

    const width = 400, height = 160, padding = 20;
    this.chartPoints = this.chartData.map((d, i) => ({
      x: padding + (i * (width - 2 * padding) / (this.chartData.length - 1)),
      y: height - (d.value / roundedMax * (height - padding))
    }));
  }

  getChartPoints(): string {
    return this.chartPoints.map(p => `${p.x},${p.y}`).join(' ');
  }

  getAreaPoints(): string {
    const points = this.getChartPoints();
    if (!points) return '';
    return `20,160 ${points} 380,160`;
  }
}
