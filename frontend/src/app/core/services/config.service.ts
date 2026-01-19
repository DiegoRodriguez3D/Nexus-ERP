import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface AppConfig {
    apiUrl: string;
}

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    private config: AppConfig | null = null;

    constructor(private http: HttpClient) { }

    async loadConfig(): Promise<void> {
        try {
            this.config = await lastValueFrom(this.http.get<AppConfig>('/assets/config.json'));
        } catch (error) {
            console.error('Could not load configuration', error);
            // Fallback for local development if file is missing
            this.config = {
                apiUrl: 'http://localhost:3000'
            };
        }
    }

    get apiUrl(): string {
        return this.config?.apiUrl || 'http://localhost:3000';
    }
}
