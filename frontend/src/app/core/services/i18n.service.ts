import { Injectable, signal } from '@angular/core';

export type Language = 'es' | 'en';

interface Translations {
    [key: string]: {
        es: string;
        en: string;
    };
}

const TRANSLATIONS: Translations = {
    // Navigation
    'nav.dashboard': { es: 'Panel de Control', en: 'Dashboard' },
    'nav.inventory': { es: 'Inventario', en: 'Inventory' },
    'nav.movements': { es: 'Movimientos', en: 'Movements' },
    'nav.suppliers': { es: 'Proveedores', en: 'Suppliers' },
    'nav.reports': { es: 'Informes', en: 'Reports' },

    // Dashboard
    'dashboard.title': { es: 'Panel de Control', en: 'Dashboard' },
    'dashboard.totalStockValue': { es: 'Valor Total del Stock', en: 'Total Stock Value' },
    'dashboard.lowStockAlerts': { es: 'Alertas de Stock Bajo', en: 'Low Stock Alerts' },
    'dashboard.recentMovements': { es: 'Movimientos Recientes', en: 'Recent Movements' },
    'dashboard.noAlerts': { es: 'Sin alertas de stock bajo', en: 'No low stock alerts' },

    // Inventory
    'inventory.title': { es: 'Inventario', en: 'Inventory' },
    'inventory.newProduct': { es: 'Nuevo Producto', en: 'New Product' },
    'inventory.filter': { es: 'Filtrar...', en: 'Filter...' },
    'inventory.all': { es: 'Todos', en: 'All' },
    'inventory.name': { es: 'Nombre', en: 'Name' },
    'inventory.sku': { es: 'SKU', en: 'SKU' },
    'inventory.stockLevel': { es: 'Nivel de Stock', en: 'Stock Level' },
    'inventory.price': { es: 'Precio', en: 'Price' },
    'inventory.noProducts': { es: 'No se encontraron productos', en: 'No products found' },

    // Login
    'login.title': { es: 'Iniciar Sesión', en: 'Sign In' },
    'login.email': { es: 'Correo Electrónico', en: 'Email' },
    'login.password': { es: 'Contraseña', en: 'Password' },
    'login.submit': { es: 'Iniciar Sesión', en: 'Sign In' },
    'login.error': { es: 'Credenciales inválidas', en: 'Invalid credentials' },

    // Common
    'common.logout': { es: 'Cerrar Sesión', en: 'Logout' },
    'common.settings': { es: 'Configuración', en: 'Settings' },
    'common.notifications': { es: 'Notificaciones', en: 'Notifications' },
    'common.ago': { es: 'hace', en: 'ago' },
    'common.months': { es: 'meses', en: 'months' },
    'common.days': { es: 'días', en: 'days' },
    'common.hours': { es: 'horas', en: 'hours' },
    'common.minutes': { es: 'minutos', en: 'minutes' },
};

@Injectable({
    providedIn: 'root'
})
export class I18nService {
    private readonly LANG_KEY = 'nexus_lang';

    currentLang = signal<Language>(this.getStoredLang());

    private getStoredLang(): Language {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(this.LANG_KEY);
            if (stored === 'es' || stored === 'en') {
                return stored;
            }
        }
        return 'es'; // Default to Spanish
    }

    setLanguage(lang: Language): void {
        this.currentLang.set(lang);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.LANG_KEY, lang);
        }
    }

    t(key: string): string {
        const translation = TRANSLATIONS[key];
        if (!translation) {
            console.warn(`Missing translation for key: ${key}`);
            return key;
        }
        return translation[this.currentLang()];
    }

    toggleLanguage(): void {
        const newLang = this.currentLang() === 'es' ? 'en' : 'es';
        this.setLanguage(newLang);
    }
}
