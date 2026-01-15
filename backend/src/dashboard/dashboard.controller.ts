import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
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
