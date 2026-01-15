import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = 'nexus_theme';

    currentTheme = signal<Theme>(this.getStoredTheme());

    constructor() {
        this.applyTheme(this.currentTheme());
    }

    private getStoredTheme(): Theme {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(this.THEME_KEY);
            if (stored === 'light' || stored === 'dark') {
                return stored;
            }
        }
        return 'dark'; // Default to dark theme as per reference
    }

    toggleTheme(): void {
        const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme: Theme): void {
        this.currentTheme.set(theme);
        this.applyTheme(theme);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.THEME_KEY, theme);
        }
    }

    private applyTheme(theme: Theme): void {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }
}
