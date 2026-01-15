import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, StockMovement, PaginatedMovements } from '../../core/services/api.service';
import { ProductService, Product } from '../../core/services/product.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="movements">
      <div class="page-header">
        <h1>{{ i18n.currentLang() === 'es' ? 'Movimientos de Stock' : 'Stock Movements' }}</h1>
        <button class="btn-primary" (click)="showModal = true">
          <i class="pi pi-plus"></i> {{ i18n.currentLang() === 'es' ? 'Nuevo Movimiento' : 'New Movement' }}
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" [placeholder]="i18n.currentLang() === 'es' ? 'Buscar producto...' : 'Search product...'" 
                 [(ngModel)]="searchTerm" (input)="onSearch()" />
        </div>
        <select [(ngModel)]="typeFilter" (change)="loadData()">
          <option value="">{{ i18n.currentLang() === 'es' ? 'Todos' : 'All' }}</option>
          <option value="IN">{{ i18n.currentLang() === 'es' ? 'Entradas' : 'In' }}</option>
          <option value="OUT">{{ i18n.currentLang() === 'es' ? 'Salidas' : 'Out' }}</option>
        </select>
      </div>

      <div class="loading" *ngIf="loading"><i class="pi pi-spin pi-spinner"></i></div>

      <div class="table-container card" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ i18n.currentLang() === 'es' ? 'Fecha' : 'Date' }}</th>
              <th>{{ i18n.currentLang() === 'es' ? 'Tipo' : 'Type' }}</th>
              <th>{{ i18n.currentLang() === 'es' ? 'Producto' : 'Product' }}</th>
              <th>{{ i18n.currentLang() === 'es' ? 'Cantidad' : 'Quantity' }}</th>
              <th>{{ i18n.currentLang() === 'es' ? 'Notas' : 'Notes' }}</th>
              <th>{{ i18n.currentLang() === 'es' ? 'Usuario' : 'User' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let mov of movements">
              <td>{{ formatDate(mov.createdAt) }}</td>
              <td>
                <span class="type-badge" [class.in]="mov.type === 'IN'" [class.out]="mov.type === 'OUT'">
                  {{ mov.type === 'IN' ? (i18n.currentLang() === 'es' ? 'Entrada' : 'In') : (i18n.currentLang() === 'es' ? 'Salida' : 'Out') }}
                </span>
              </td>
              <td>{{ mov.product?.name || 'N/A' }}</td>
              <td class="qty" [class.positive]="mov.type === 'IN'" [class.negative]="mov.type === 'OUT'">
                {{ mov.type === 'IN' ? '+' : '-' }}{{ mov.quantity }}
              </td>
              <td>{{ mov.notes || '-' }}</td>
              <td>{{ mov.user?.email || 'N/A' }}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="no-data" *ngIf="movements.length === 0">
          <i class="pi pi-inbox"></i>
          <span>{{ i18n.currentLang() === 'es' ? 'No hay movimientos' : 'No movements' }}</span>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">
            <i class="pi pi-chevron-left"></i>
          </button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">
            <i class="pi pi-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ i18n.currentLang() === 'es' ? 'Nuevo Movimiento' : 'New Movement' }}</h2>
          <form (ngSubmit)="createMovement()">
            <div class="form-group">
              <label>{{ i18n.currentLang() === 'es' ? 'Producto' : 'Product' }}</label>
              <select [(ngModel)]="newMovement.productId" name="productId" required>
                <option value="">{{ i18n.currentLang() === 'es' ? 'Seleccionar...' : 'Select...' }}</option>
                <option *ngFor="let p of products" [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ i18n.currentLang() === 'es' ? 'Tipo' : 'Type' }}</label>
              <select [(ngModel)]="newMovement.type" name="type" required>
                <option value="IN">{{ i18n.currentLang() === 'es' ? 'Entrada' : 'In' }}</option>
                <option value="OUT">{{ i18n.currentLang() === 'es' ? 'Salida' : 'Out' }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ i18n.currentLang() === 'es' ? 'Cantidad' : 'Quantity' }}</label>
              <input type="number" [(ngModel)]="newMovement.quantity" name="quantity" min="1" required />
            </div>
            <div class="form-group">
              <label>{{ i18n.currentLang() === 'es' ? 'Notas' : 'Notes' }}</label>
              <input type="text" [(ngModel)]="newMovement.notes" name="notes" />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="showModal = false">
                {{ i18n.currentLang() === 'es' ? 'Cancelar' : 'Cancel' }}
              </button>
              <button type="submit" class="btn-primary" [disabled]="saving">
                {{ i18n.currentLang() === 'es' ? 'Guardar' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .movements { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.75rem; font-weight: 600; }
    .filters-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .search-box { flex: 1; max-width: 300px; position: relative; }
    .search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
    .search-box input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-card); color: var(--text-primary); }
    .filters-bar select { padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-card); color: var(--text-primary); }
    .loading { display: flex; justify-content: center; padding: 3rem; color: var(--accent-color); }
    .loading i { font-size: 2rem; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 1rem; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border-color); }
    .data-table td { padding: 1rem; font-size: 0.875rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
    .data-table tr:hover { background: var(--bg-hover); }
    .type-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: var(--radius-sm); font-weight: 500; font-size: 0.75rem; }
    .type-badge.in { background: rgba(34, 197, 94, 0.1); color: var(--success-color); }
    .type-badge.out { background: rgba(239, 68, 68, 0.1); color: var(--danger-color); }
    .qty { font-weight: 600; }
    .qty.positive { color: var(--success-color); }
    .qty.negative { color: var(--danger-color); }
    .no-data { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; color: var(--text-muted); }
    .no-data i { font-size: 3rem; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1rem; border-top: 1px solid var(--border-color); }
    .pagination button { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); border-radius: var(--radius-sm); cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .pagination span { font-size: 0.875rem; color: var(--text-secondary); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--bg-card); border-radius: var(--radius-lg); padding: 2rem; width: 100%; max-width: 500px; }
    .modal h2 { margin-bottom: 1.5rem; font-size: 1.25rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); }
    .form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-secondary); color: var(--text-primary); }
    .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    .btn-secondary { padding: 0.75rem 1.5rem; border: 1px solid var(--border-color); background: transparent; color: var(--text-primary); border-radius: var(--radius-md); cursor: pointer; }
  `]
})
export class MovementsComponent implements OnInit {
  private api = inject(ApiService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  i18n = inject(I18nService);

  movements: StockMovement[] = [];
  products: Product[] = [];
  loading = true;
  showModal = false;
  saving = false;
  searchTerm = '';
  typeFilter = '';
  currentPage = 1;
  totalPages = 1;
  private searchTimeout: any;

  newMovement = { productId: '', type: 'IN' as 'IN' | 'OUT', quantity: 1, notes: '' };

  ngOnInit() {
    this.loadData();
    this.productService.getProducts().subscribe({ next: (data) => { this.products = data; this.cdr.detectChanges(); } });
  }

  loadData() {
    this.loading = true;
    this.api.getMovements({ page: this.currentPage, search: this.searchTerm, type: this.typeFilter }).subscribe({
      next: (res) => {
        this.movements = res.data;
        this.totalPages = res.totalPages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadData();
    }, 300);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadData();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  createMovement() {
    if (!this.newMovement.productId || !this.newMovement.quantity) return;
    this.saving = true;
    this.api.createMovement(this.newMovement).subscribe({
      next: () => {
        this.showModal = false;
        this.saving = false;
        this.newMovement = { productId: '', type: 'IN', quantity: 1, notes: '' };
        this.loadData();
      },
      error: (err) => {
        this.saving = false;
        alert(err.error?.message || 'Error al crear movimiento');
      }
    });
  }
}
