import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface Product {
    id: string;
    sku: string;
    name: string;
    price: string | number;
    stock: number;
    categoryId: string;
    createdAt: string;
    category?: { id: string; name: string };
}

export interface Category {
    id: string;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? 'https://nexus-erp-3kpp.onrender.com'
        : 'http://localhost:3000';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/products`, { headers: this.getHeaders() });
    }

    getProduct(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
    }

    createProduct(product: Partial<Product>): Observable<Product> {
        return this.http.post<Product>(`${this.apiUrl}/products`, product, { headers: this.getHeaders() });
    }

    updateProduct(id: string, product: Partial<Product>): Observable<Product> {
        return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, product, { headers: this.getHeaders() });
    }

    deleteProduct(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
    }

    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.apiUrl}/categories`, { headers: this.getHeaders() });
    }
}
