import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats, LowStockProduct, ChartData } from '../../core/services/dashboard.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>{{ i18n.t('dashboard.title') }}</h1>
        <button class="btn-primary">{{ i18n.t('nav.dashboard') }}</button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ i18n.t('dashboard.totalStockValue') }}</div>
          <div class="stat-value">
            <span class="amount">€{{ formatNumber(stats?.totalStockValue || 0) }}</span>
            <span class="change positive" *ngIf="stats?.percentageChange">
              +{{ stats?.percentageChange }}%
            </span>
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
              <div class="alert-icon">
                <i class="pi pi-exclamation-triangle"></i>
              </div>
              <div class="alert-content">
                <span class="alert-name">{{ product.name }}</span>
                <span class="alert-stock">Stock: {{ product.stock }}</span>
              </div>
            </div>
            <div class="no-data" *ngIf="lowStockProducts.length === 0">
              <i class="pi pi-check-circle"></i>
              <span>{{ i18n.t('dashboard.noAlerts') }}</span>
            </div>
          </div>
        </div>

        <!-- Recent Movements Chart -->
        <div class="card chart-card">
          <h3>{{ i18n.t('dashboard.recentMovements') }}</h3>
          <div class="chart-container">
            <svg viewBox="0 0 400 200" class="chart">
              <!-- Grid lines -->
              <line *ngFor="let i of [0, 1, 2, 3, 4]" 
                    [attr.x1]="0" 
                    [attr.y1]="i * 40" 
                    [attr.x2]="400" 
                    [attr.y2]="i * 40" 
                    stroke="var(--border-color)" 
                    stroke-width="1"/>
              
              <!-- Chart line -->
              <polyline
                fill="none"
                stroke="var(--accent-color)"
                stroke-width="2"
                [attr.points]="getChartPoints()"/>
              
              <!-- Gradient area -->
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:var(--accent-color);stop-opacity:0.3"/>
                  <stop offset="100%" style="stop-color:var(--accent-color);stop-opacity:0"/>
                </linearGradient>
              </defs>
              <polygon
                fill="url(#chartGradient)"
                [attr.points]="getAreaPoints()"/>
            </svg>
            
            <!-- X-axis labels -->
            <div class="chart-labels">
              <span *ngFor="let data of chartData">{{ data.month }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1400px; }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .dashboard-header h1 { font-size: 1.75rem; font-weight: 600; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }
    .stat-label { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
    .stat-value { display: flex; align-items: baseline; gap: 0.75rem; }
    .amount { font-size: 2rem; font-weight: 700; color: var(--text-primary); }
    .change { font-size: 0.875rem; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); }
    .change.positive { background: rgba(34, 197, 94, 0.1); color: var(--success-color); }
    .content-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem; }
    .card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }
    .low-stock-card { max-height: 400px; overflow-y: auto; }
    .alerts-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .alert-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bg-hover);
      border-radius: var(--radius-md);
    }
    .alert-icon {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(245, 158, 11, 0.1);
      color: var(--warning-color);
      border-radius: var(--radius-sm);
    }
    .alert-content { flex: 1; display: flex; justify-content: space-between; align-items: center; }
    .alert-name { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
    .alert-stock { font-size: 0.75rem; color: var(--danger-color); font-weight: 600; }
    .no-data {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.5rem; padding: 2rem; color: var(--text-muted);
    }
    .no-data i { font-size: 2rem; color: var(--success-color); }
    .chart-container { position: relative; }
    .chart { width: 100%; height: 200px; }
    .chart-labels {
      display: flex; justify-content: space-between;
      padding: 0.5rem 0; font-size: 0.75rem; color: var(--text-muted);
    }
    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: 1fr; }
      .content-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  i18n = inject(I18nService);

  stats: DashboardStats | null = null;
  lowStockProducts: LowStockProduct[] = [];
  chartData: ChartData[] = [];

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.dashboardService.getStats().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Error loading stats:', err)
    });

    this.dashboardService.getLowStockProducts().subscribe({
      next: (data) => this.lowStockProducts = data,
      error: (err) => console.error('Error loading low stock:', err)
    });

    this.dashboardService.getMovementsChart().subscribe({
      next: (data) => this.chartData = data.length ? data : this.getMockChartData(),
      error: () => this.chartData = this.getMockChartData()
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

  getChartPoints(): string {
    if (this.chartData.length === 0) return '';
    const maxValue = Math.max(...this.chartData.map(d => d.value), 1);
    const width = 400, height = 160, padding = 20;
    return this.chartData.map((d, i) => {
      const x = padding + (i * (width - 2 * padding) / (this.chartData.length - 1));
      const y = height - (d.value / maxValue * (height - padding));
      return `${x},${y}`;
    }).join(' ');
  }

  getAreaPoints(): string {
    const points = this.getChartPoints();
    if (!points) return '';
    return `20,160 ${points} 380,160`;
  }
}
