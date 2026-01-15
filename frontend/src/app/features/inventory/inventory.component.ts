import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../core/services/product.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inventory">
      <!-- Header -->
      <div class="inventory-header">
        <h1>{{ i18n.t('inventory.title') }}</h1>
        <button class="btn-primary" (click)="openNewProductModal()">
          <i class="pi pi-plus"></i> {{ i18n.t('inventory.newProduct') }}
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input 
            type="text" 
            [placeholder]="i18n.t('inventory.filter')" 
            [(ngModel)]="searchTerm"
            (input)="filterProducts()"
          />
        </div>
        <div class="filter-group">
          <select [(ngModel)]="selectedCategory" (change)="filterProducts()">
            <option value="">{{ i18n.t('inventory.all') }}</option>
            <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Cargando...</span>
      </div>

      <!-- Table -->
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
                  <div class="product-avatar" [style.background]="getAvatarColor(product.name)">
                    <i class="pi pi-box"></i>
                  </div>
                  <span class="product-name">{{ product.name }}</span>
                </div>
              </td>
              <td>{{ product.sku }}</td>
              <td>
                <span class="stock-badge" [class.low]="product.stock < 10" [class.ok]="product.stock >= 10">
                  {{ product.stock }}
                </span>
              </td>
              <td>€{{ formatPrice(product.price) }}</td>
              <td>
                <button class="icon-btn-sm">
                  <i class="pi pi-ellipsis-h"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="no-data" *ngIf="filteredProducts.length === 0">
          <i class="pi pi-inbox"></i>
          <span>{{ i18n.t('inventory.noProducts') }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inventory { max-width: 1400px; }
    .inventory-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;
    }
    .inventory-header h1 { font-size: 1.75rem; font-weight: 600; }
    .btn-primary i { margin-right: 0.5rem; }
    .filters-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .search-box { flex: 1; max-width: 300px; position: relative; }
    .search-box i {
      position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);
    }
    .search-box input {
      width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid var(--border-color); border-radius: var(--radius-md);
      background: var(--bg-card); color: var(--text-primary); font-size: 0.875rem;
    }
    .search-box input::placeholder { color: var(--text-muted); }
    .search-box input:focus { outline: none; border-color: var(--accent-color); }
    .filter-group select {
      padding: 0.75rem 1rem; border: 1px solid var(--border-color);
      border-radius: var(--radius-md); background: var(--bg-card);
      color: var(--text-primary); font-size: 0.875rem; cursor: pointer;
    }
    .loading {
      display: flex; align-items: center; justify-content: center; gap: 1rem;
      padding: 3rem; color: var(--accent-color);
    }
    .loading i { font-size: 1.5rem; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      text-align: left; padding: 1rem; font-size: 0.75rem; font-weight: 600;
      color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border-color);
    }
    .data-table td {
      padding: 1rem; font-size: 0.875rem; color: var(--text-primary);
      border-bottom: 1px solid var(--border-color);
    }
    .data-table tr:hover { background: var(--bg-hover); }
    .product-cell { display: flex; align-items: center; gap: 0.75rem; }
    .product-avatar {
      width: 36px; height: 36px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center; color: white;
    }
    .product-avatar i { font-size: 1rem; }
    .product-name { font-weight: 500; }
    .stock-badge {
      display: inline-block; padding: 0.25rem 0.75rem;
      border-radius: var(--radius-sm); font-weight: 500; font-size: 0.8125rem;
    }
    .stock-badge.ok { background: rgba(34, 197, 94, 0.1); color: var(--success-color); }
    .stock-badge.low { background: rgba(239, 68, 68, 0.1); color: var(--danger-color); }
    .icon-btn-sm {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; color: var(--text-muted);
      border-radius: var(--radius-sm); cursor: pointer;
    }
    .icon-btn-sm:hover { background: var(--bg-hover); color: var(--text-primary); }
    .no-data {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.75rem; padding: 3rem; color: var(--text-muted);
    }
    .no-data i { font-size: 3rem; }
  `]
})
export class InventoryComponent implements OnInit {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  i18n = inject(I18nService);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  searchTerm = '';
  selectedCategory = '';
  loading = true;

  private colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4'];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.extractCategories();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  extractCategories() {
    const cats = new Set(this.products.map(p => p.category?.name).filter(Boolean));
    this.categories = Array.from(cats) as string[];
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || p.category?.name === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  getAvatarColor(name: string): string {
    return this.colors[name.charCodeAt(0) % this.colors.length];
  }

  formatPrice(price: string | number): string {
    return (typeof price === 'string' ? parseFloat(price) : price).toFixed(2);
  }

  openNewProductModal() {
    alert('Nuevo Producto - Próximamente');
  }
}
