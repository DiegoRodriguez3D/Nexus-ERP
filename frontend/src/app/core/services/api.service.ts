import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from './config.service';

export interface Supplier {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    createdAt: string;
    products?: { id: string; name: string }[];
}

export interface StockMovement {
    id: string;
    type: 'IN' | 'OUT';
    quantity: number;
    notes?: string;
    productId: string;
    userId: string;
    createdAt: string;
    product?: { id: string; name: string; sku: string };
    user?: { email: string };
}

export interface PaginatedMovements {
    data: StockMovement[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {


    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private configService: ConfigService
    ) { }

    private get apiUrl() {
        return this.configService.apiUrl;
    }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    // Suppliers
    getSuppliers(): Observable<Supplier[]> {
        return this.http.get<Supplier[]>(`${this.apiUrl}/suppliers`, { headers: this.getHeaders() });
    }

    createSupplier(data: Partial<Supplier>): Observable<Supplier> {
        return this.http.post<Supplier>(`${this.apiUrl}/suppliers`, data, { headers: this.getHeaders() });
    }

    updateSupplier(id: string, data: Partial<Supplier>): Observable<Supplier> {
        return this.http.patch<Supplier>(`${this.apiUrl}/suppliers/${id}`, data, { headers: this.getHeaders() });
    }

    deleteSupplier(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/suppliers/${id}`, { headers: this.getHeaders() });
    }

    // Stock Movements
    getMovements(params?: { page?: number; limit?: number; search?: string; type?: string }): Observable<PaginatedMovements> {
        let url = `${this.apiUrl}/inventory?page=${params?.page || 1}&limit=${params?.limit || 20}`;
        if (params?.search) url += `&search=${encodeURIComponent(params.search)}`;
        if (params?.type) url += `&type=${params.type}`;
        return this.http.get<PaginatedMovements>(url, { headers: this.getHeaders() });
    }

    createMovement(data: { productId: string; type: 'IN' | 'OUT'; quantity: number; notes?: string }): Observable<StockMovement> {
        return this.http.post<StockMovement>(`${this.apiUrl}/inventory`, data, { headers: this.getHeaders() });
    }

    // Categories
    getCategories(): Observable<{ id: string; name: string }[]> {
        return this.http.get<{ id: string; name: string }[]>(`${this.apiUrl}/categories`, { headers: this.getHeaders() });
    }
}
