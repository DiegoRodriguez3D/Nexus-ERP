import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { DashboardService, DashboardStats, LowStockProduct, ChartData } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  providers: [CurrencyPipe, DatePipe],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <button class="btn-primary">Dashboard</button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Stock Value</div>
          <div class="stat-value">
            <span class="amount">€{{ formatNumber(stats?.totalStockValue || 0) }}</span>
            <span class="change positive" *ngIf="stats?.percentageChange">
              +{{ stats?.percentageChange }}%
            </span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Low Stock Alerts</div>
          <div class="stat-value">
            <span class="amount alert-count">{{ stats?.lowStockCount || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Low Stock Alerts List -->
        <div class="card low-stock-card">
          <h3>Low Stock Alerts</h3>
          <div class="alerts-list">
            <div class="alert-item" *ngFor="let product of lowStockProducts">
              <div class="alert-icon">
                <i class="pi pi-exclamation-triangle"></i>
              </div>
              <div class="alert-content">
                <span class="alert-name">{{ product.name }}</span>
                <span class="alert-time">{{ getTimeAgo(product.createdAt) }}</span>
              </div>
            </div>
            <div class="no-data" *ngIf="lowStockProducts.length === 0">
              <i class="pi pi-check-circle"></i>
              <span>No low stock alerts</span>
            </div>
          </div>
        </div>

        <!-- Recent Movements Chart -->
        <div class="card chart-card">
          <h3>Recent Movements</h3>
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
    .dashboard {
      max-width: 1400px;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .dashboard-header h1 {
      font-size: 1.75rem;
      font-weight: 600;
    }

    /* Stats Grid */
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

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .stat-value {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
    }

    .amount {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .alert-count {
      color: var(--text-primary);
    }

    .change {
      font-size: 0.875rem;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
    }

    .change.positive {
      background: rgba(34, 197, 94, 0.1);
      color: var(--success-color);
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 1.5rem;
    }

    .card h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    /* Low Stock Card */
    .low-stock-card {
      max-height: 400px;
      overflow-y: auto;
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bg-hover);
      border-radius: var(--radius-md);
    }

    .alert-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(245, 158, 11, 0.1);
      color: var(--warning-color);
      border-radius: var(--radius-sm);
    }

    .alert-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .alert-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .alert-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem;
      color: var(--text-muted);
    }

    .no-data i {
      font-size: 2rem;
      color: var(--success-color);
    }

    /* Chart Card */
    .chart-container {
      position: relative;
    }

    .chart {
      width: 100%;
      height: 200px;
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

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
      error: (err) => {
        console.error('Error loading chart:', err);
        this.chartData = this.getMockChartData();
      }
    });
  }

  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(2);
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  }

  getMockChartData(): ChartData[] {
    return [
      { month: 'Jan', value: 50 },
      { month: 'Feb', value: 80 },
      { month: 'Mar', value: 120 },
      { month: 'Apr', value: 200 },
      { month: 'May', value: 280 },
      { month: 'Jun', value: 320 },
    ];
  }

  getChartPoints(): string {
    if (this.chartData.length === 0) return '';
    const maxValue = Math.max(...this.chartData.map(d => d.value), 1);
    const width = 400;
    const height = 160;
    const padding = 20;

    return this.chartData.map((d, i) => {
      const x = padding + (i * (width - 2 * padding) / (this.chartData.length - 1));
      const y = height - (d.value / maxValue * (height - padding));
      return `${x},${y}`;
    }).join(' ');
  }

  getAreaPoints(): string {
    const points = this.getChartPoints();
    if (!points) return '';
    const width = 400;
    const height = 160;
    const padding = 20;
    const firstX = padding;
    const lastX = width - padding;
    return `${firstX},${height} ${points} ${lastX},${height}`;
  }
}
