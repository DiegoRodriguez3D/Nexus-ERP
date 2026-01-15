import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface DashboardStats {
    totalStockValue: number;
    totalProducts: number;
    lowStockCount: number;
    percentageChange: number;
}

export interface LowStockProduct {
    id: string;
    name: string;
    sku: string;
    stock: number;
    createdAt: string;
}

export interface StockMovement {
    id: string;
    type: 'IN' | 'OUT';
    quantity: number;
    createdAt: string;
    product: { name: string };
    user: { email: string };
}

export interface ChartData {
    month: string;
    value: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? 'https://nexus-erp-3kpp.onrender.com/dashboard'
        : 'http://localhost:3000/dashboard';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
    }

    getLowStockProducts(): Observable<LowStockProduct[]> {
        return this.http.get<LowStockProduct[]>(`${this.apiUrl}/low-stock`, { headers: this.getHeaders() });
    }

    getRecentMovements(): Observable<StockMovement[]> {
        return this.http.get<StockMovement[]>(`${this.apiUrl}/recent-movements`, { headers: this.getHeaders() });
    }

    getMovementsChart(): Observable<ChartData[]> {
        return this.http.get<ChartData[]>(`${this.apiUrl}/movements-chart`, { headers: this.getHeaders() });
    }
}
