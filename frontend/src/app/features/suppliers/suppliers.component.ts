import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Supplier } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="suppliers">
      <div class="page-header">
        <h1>{{ i18n.currentLang() === 'es' ? 'Proveedores' : 'Suppliers' }}</h1>
        <button class="btn-primary" (click)="openModal()">
          <i class="pi pi-plus"></i> {{ i18n.currentLang() === 'es' ? 'Nuevo Proveedor' : 'New Supplier' }}
        </button>
      </div>

      <!-- Search -->
      <div class="filters-bar">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" [placeholder]="i18n.currentLang() === 'es' ? 'Buscar proveedor...' : 'Search supplier...'" 
                 [(ngModel)]="searchTerm" (input)="filterSuppliers()" />
        </div>
      </div>

      <div class="loading" *ngIf="loading"><i class="pi pi-spin pi-spinner"></i></div>

      <div class="suppliers-grid" *ngIf="!loading">
        <div class="supplier-card card" *ngFor="let supplier of filteredSuppliers">
          <div class="supplier-header">
            <div class="supplier-avatar"><i class="pi pi-building"></i></div>
            <div class="supplier-info">
              <h3>{{ supplier.name }}</h3>
              <span class="products-count">{{ supplier.products?.length || 0 }} {{ i18n.currentLang() === 'es' ? 'productos' : 'products' }}</span>
            </div>
            <div class="supplier-actions">
              <button class="icon-btn" (click)="editSupplier(supplier)"><i class="pi pi-pencil"></i></button>
              <button class="icon-btn danger" (click)="deleteSupplier(supplier.id)"><i class="pi pi-trash"></i></button>
            </div>
          </div>
          <div class="supplier-details">
            <div class="detail" *ngIf="supplier.email"><i class="pi pi-envelope"></i> {{ supplier.email }}</div>
            <div class="detail" *ngIf="supplier.phone"><i class="pi pi-phone"></i> {{ supplier.phone }}</div>
            <div class="detail" *ngIf="supplier.address"><i class="pi pi-map-marker"></i> {{ supplier.address }}</div>
          </div>
        </div>
        <div class="no-data" *ngIf="filteredSuppliers.length === 0">
          <i class="pi pi-building"></i>
          <span>{{ i18n.currentLang() === 'es' ? 'No hay proveedores' : 'No suppliers' }}</span>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ editingId ? (i18n.currentLang() === 'es' ? 'Editar Proveedor' : 'Edit Supplier') : (i18n.currentLang() === 'es' ? 'Nuevo Proveedor' : 'New Supplier') }}</h2>
          <form (ngSubmit)="saveSupplier()">
            <div class="form-group">
              <label>{{ i18n.currentLang() === 'es' ? 'Nombre' : 'Name' }} *</label>
              <input type="text" [(ngModel)]="formData.name" name="name" required />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="formData.email" name="email" />
            </div>
            <div class="form-group">
              <label>{{ i18n.currentLang() === 'es' ? 'Teléfono' : 'Phone' }}</label>
              <input type="tel" [(ngModel)]="formData.phone" name="phone" />
            </div>
            <div class="form-group">
              <label>{{ i18n.currentLang() === 'es' ? 'Dirección' : 'Address' }}</label>
              <input type="text" [(ngModel)]="formData.address" name="address" />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="showModal = false">{{ i18n.currentLang() === 'es' ? 'Cancelar' : 'Cancel' }}</button>
              <button type="submit" class="btn-primary" [disabled]="saving">{{ i18n.currentLang() === 'es' ? 'Guardar' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .suppliers { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.75rem; font-weight: 600; }
    .filters-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .search-box { flex: 1; max-width: 300px; position: relative; }
    .search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
    .search-box input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-card); color: var(--text-primary); }
    .loading { display: flex; justify-content: center; padding: 3rem; color: var(--accent-color); }
    .loading i { font-size: 2rem; }
    .suppliers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
    .supplier-card { padding: 1.5rem; }
    .supplier-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
    .supplier-avatar { width: 48px; height: 48px; background: var(--accent-color); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem; }
    .supplier-info { flex: 1; }
    .supplier-info h3 { margin: 0 0 0.25rem; font-size: 1rem; color: var(--text-primary); }
    .products-count { font-size: 0.75rem; color: var(--text-muted); }
    .supplier-actions { display: flex; gap: 0.5rem; }
    .icon-btn { width: 32px; height: 32px; border: none; background: var(--bg-hover); color: var(--text-secondary); border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { color: var(--text-primary); }
    .icon-btn.danger:hover { color: var(--danger-color); background: rgba(239, 68, 68, 0.1); }
    .supplier-details { display: flex; flex-direction: column; gap: 0.5rem; }
    .detail { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: var(--text-secondary); }
    .detail i { color: var(--text-muted); width: 1rem; }
    .no-data { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; color: var(--text-muted); }
    .no-data i { font-size: 3rem; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--bg-card); border-radius: var(--radius-lg); padding: 2rem; width: 100%; max-width: 500px; }
    .modal h2 { margin-bottom: 1.5rem; font-size: 1.25rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); }
    .form-group input { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-secondary); color: var(--text-primary); }
    .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    .btn-secondary { padding: 0.75rem 1.5rem; border: 1px solid var(--border-color); background: transparent; color: var(--text-primary); border-radius: var(--radius-md); cursor: pointer; }
  `]
})
export class SuppliersComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  i18n = inject(I18nService);

  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  loading = true;
  showModal = false;
  saving = false;
  editingId: string | null = null;
  searchTerm = '';
  formData = { name: '', email: '', phone: '', address: '' };

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading = true;
    this.api.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.filteredSuppliers = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  filterSuppliers() {
    const term = this.searchTerm.toLowerCase();
    this.filteredSuppliers = this.suppliers.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.phone?.includes(term)
    );
  }

  openModal() {
    this.editingId = null;
    this.formData = { name: '', email: '', phone: '', address: '' };
    this.showModal = true;
  }

  editSupplier(s: Supplier) {
    this.editingId = s.id;
    this.formData = { name: s.name, email: s.email || '', phone: s.phone || '', address: s.address || '' };
    this.showModal = true;
  }

  saveSupplier() {
    if (!this.formData.name) return;
    this.saving = true;
    const obs = this.editingId
      ? this.api.updateSupplier(this.editingId, this.formData)
      : this.api.createSupplier(this.formData);
    obs.subscribe({
      next: () => { this.showModal = false; this.saving = false; this.loadData(); },
      error: () => { this.saving = false; }
    });
  }

  deleteSupplier(id: string) {
    if (confirm(this.i18n.currentLang() === 'es' ? '¿Eliminar este proveedor?' : 'Delete this supplier?')) {
      this.api.deleteSupplier(id).subscribe({ next: () => this.loadData() });
    }
  }
}
