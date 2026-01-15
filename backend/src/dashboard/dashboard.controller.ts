import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    getStats() {
        return this.dashboardService.getStats();
    }

    @Get('low-stock')
    getLowStock() {
        return this.dashboardService.getLowStockProducts();
    }

    @Get('recent-movements')
    getRecentMovements() {
        return this.dashboardService.getRecentMovements();
    }

    @Get('movements-chart')
    getMovementsChart() {
        return this.dashboardService.getMovementsByMonth();
    }
}
