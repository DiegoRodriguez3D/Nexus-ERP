import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface AppConfig {
    apiUrl: string;
    portfolioUrl?: string;
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
                this.config = {
                    apiUrl: 'http://localhost:3000',
                    portfolioUrl: 'https://diego-rodriguez.es'
                };
            }
        }

    get apiUrl(): string {
            return this.config?.apiUrl || 'http://localhost:3000';
        }

    get portfolioUrl(): string {
            return this.config?.portfolioUrl || 'https://diego-rodriguez.es';
        }
    }
