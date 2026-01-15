import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, Category } from '../../core/services/product.service';
import { ApiService, Supplier } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inventory">
      <div class="inventory-header">
        <h1>{{ i18n.t('inventory.title') }}</h1>
        <button class="btn-primary" (click)="openModal()">
          <i class="pi pi-plus"></i> {{ i18n.t('inventory.newProduct') }}
        </button>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" [placeholder]="i18n.t('inventory.filter')" [(ngModel)]="searchTerm" (input)="filterProducts()" />
        </div>
        <div class="filter-group">
          <select [(ngModel)]="selectedCategory" (change)="filterProducts()">
            <option value="">{{ i18n.t('inventory.all') }}</option>
            <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <div class="loading" *ngIf="loading"><i class="pi pi-spin pi-spinner"></i><span>Cargando...</span></div>

      <div class="table-container card" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ i18n.t('inventory.name') }}</th>
              <th>{{ i18n.t('inventory.sku') }}</th>
              <th>{{ i18n.t('inventory.stockLevel') }}</th>
              <th>{{ i18n.t('inventory.price') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of filteredProducts">
              <td>
                <div class="product-cell">
                  <div class="product-avatar" [style.background]="getAvatarColor(product.name)"><i class="pi pi-box"></i></div>
                  <span class="product-name">{{ product.name }}</span>
                </div>
              </td>
              <td>{{ product.sku }}</td>
              <td><span class="stock-badge" [class.low]="product.stock < 10" [class.ok]="product.stock >= 10">{{ product.stock }}</span></td>
              <td>€{{ formatPrice(product.price) }}</td>
              <td>
                <div class="actions">
                  <button class="icon-btn-sm" (click)="editProduct(product)"><i class="pi pi-pencil"></i></button>
                  <button class="icon-btn-sm danger" (click)="deleteProduct(product.id)"><i class="pi pi-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="no-data" *ngIf="filteredProducts.length === 0"><i class="pi pi-inbox"></i><span>{{ i18n.t('inventory.noProducts') }}</span></div>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ editingId ? (i18n.currentLang() === 'es' ? 'Editar Producto' : 'Edit Product') : i18n.t('inventory.newProduct') }}</h2>
          <form (ngSubmit)="saveProduct()">
            <div class="form-row">
              <div class="form-group">
                <label>SKU *</label>
                <input type="text" [(ngModel)]="formData.sku" name="sku" required />
              </div>
              <div class="form-group">
                <label>{{ i18n.t('inventory.name') }} *</label>
                <input type="text" [(ngModel)]="formData.name" name="name" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ i18n.t('inventory.price') }} *</label>
                <input type="number" [(ngModel)]="formData.price" name="price" step="0.01" required />
              </div>
              <div class="form-group">
                <label>{{ i18n.t('inventory.stockLevel') }}</label>
                <input type="number" [(ngModel)]="formData.stock" name="stock" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ i18n.currentLang() === 'es' ? 'Categoría' : 'Category' }} *</label>
                <select [(ngModel)]="formData.categoryId" name="categoryId" required>
                  <option value="">{{ i18n.currentLang() === 'es' ? 'Seleccionar...' : 'Select...' }}</option>
                  <option *ngFor="let c of allCategories" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ i18n.currentLang() === 'es' ? 'Proveedor' : 'Supplier' }}</label>
                <select [(ngModel)]="formData.supplierId" name="supplierId">
                  <option value="">{{ i18n.currentLang() === 'es' ? 'Sin proveedor' : 'No supplier' }}</option>
                  <option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }}</option>
                </select>
              </div>
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
    .inventory { max-width: 1400px; }
    .inventory-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .inventory-header h1 { font-size: 1.75rem; font-weight: 600; }
    .btn-primary i { margin-right: 0.5rem; }
    .filters-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .search-box { flex: 1; max-width: 300px; position: relative; }
    .search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
    .search-box input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-card); color: var(--text-primary); }
    .filter-group select { padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-card); color: var(--text-primary); }
    .loading { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 3rem; color: var(--accent-color); }
    .loading i { font-size: 1.5rem; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 1rem; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border-color); }
    .data-table td { padding: 1rem; font-size: 0.875rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); }
    .data-table tr:hover { background: var(--bg-hover); }
    .product-cell { display: flex; align-items: center; gap: 0.75rem; }
    .product-avatar { width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white; }
    .product-name { font-weight: 500; }
    .stock-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: var(--radius-sm); font-weight: 500; font-size: 0.8125rem; }
    .stock-badge.ok { background: rgba(34, 197, 94, 0.1); color: var(--success-color); }
    .stock-badge.low { background: rgba(239, 68, 68, 0.1); color: var(--danger-color); }
    .actions { display: flex; gap: 0.5rem; }
    .icon-btn-sm { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; background: var(--bg-hover); color: var(--text-muted); border-radius: var(--radius-sm); cursor: pointer; }
    .icon-btn-sm:hover { color: var(--text-primary); }
    .icon-btn-sm.danger:hover { color: var(--danger-color); background: rgba(239, 68, 68, 0.1); }
    .no-data { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; color: var(--text-muted); }
    .no-data i { font-size: 3rem; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--bg-card); border-radius: var(--radius-lg); padding: 2rem; width: 100%; max-width: 600px; }
    .modal h2 { margin-bottom: 1.5rem; font-size: 1.25rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); }
    .form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-secondary); color: var(--text-primary); }
    .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    .btn-secondary { padding: 0.75rem 1.5rem; border: 1px solid var(--border-color); background: transparent; color: var(--text-primary); border-radius: var(--radius-md); cursor: pointer; }
  `]
})
export class InventoryComponent implements OnInit {
  private productService = inject(ProductService);
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  i18n = inject(I18nService);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  allCategories: Category[] = [];
  suppliers: Supplier[] = [];
  searchTerm = '';
  selectedCategory = '';
  loading = true;
  showModal = false;
  saving = false;
  editingId: string | null = null;
  formData = { sku: '', name: '', price: 0, stock: 0, categoryId: '', supplierId: '' };

  private colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4'];

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.extractCategories();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
    this.productService.getCategories().subscribe({ next: (data) => { this.allCategories = data; this.cdr.detectChanges(); } });
    this.api.getSuppliers().subscribe({ next: (data) => { this.suppliers = data; this.cdr.detectChanges(); } });
  }

  extractCategories() {
    this.categories = [...new Set(this.products.map(p => p.category?.name).filter(Boolean))] as string[];
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || p.category?.name === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  getAvatarColor(name: string): string { return this.colors[name.charCodeAt(0) % this.colors.length]; }

  formatPrice(price: string | number): string { return (typeof price === 'string' ? parseFloat(price) : price).toFixed(2); }

  openModal() {
    this.editingId = null;
    this.formData = { sku: '', name: '', price: 0, stock: 0, categoryId: '', supplierId: '' };
    this.showModal = true;
  }

  editProduct(p: Product) {
    this.editingId = p.id;
    this.formData = {
      sku: p.sku,
      name: p.name,
      price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
      stock: p.stock,
      categoryId: p.categoryId,
      supplierId: (p as any).supplierId || ''
    };
    this.showModal = true;
  }

  saveProduct() {
    if (!this.formData.sku || !this.formData.name || !this.formData.categoryId) return;
    this.saving = true;
    const data: any = { ...this.formData };
    if (!data.supplierId) delete data.supplierId;

    const obs = this.editingId
      ? this.productService.updateProduct(this.editingId, data)
      : this.productService.createProduct(data);
    obs.subscribe({
      next: () => { this.showModal = false; this.saving = false; this.loadData(); },
      error: () => { this.saving = false; }
    });
  }

  deleteProduct(id: string) {
    if (confirm(this.i18n.currentLang() === 'es' ? '¿Eliminar este producto?' : 'Delete this product?')) {
      this.productService.deleteProduct(id).subscribe({ next: () => this.loadData() });
    }
  }
}
