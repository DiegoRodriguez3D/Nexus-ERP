import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h1>Dashboard</h1>
      <p>Bienvenido a Nexus ERP</p>
    </div>
  `,
  styles: [`
    .card {
      background: var(--surface-card);
      padding: 2rem;
      border-radius: 10px;
      border: 1px solid var(--surface-border);
    }
  `]
})
export class DashboardComponent { }
