import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async getStats() {
        const products = await this.prisma.product.findMany();

        const totalStockValue = products.reduce((sum, product) => {
            return sum + (Number(product.price) * product.stock);
        }, 0);

        const totalProducts = products.length;
        const lowStockCount = products.filter(p => p.stock < 10).length;

        return {
            totalStockValue,
            totalProducts,
            lowStockCount,
            percentageChange: 9.05, // Mock for now, can be calculated with historical data
        };
    }

    async getLowStockProducts(limit = 5) {
        return this.prisma.product.findMany({
            where: {
                stock: { lt: 10 },
            },
            include: { category: true },
            orderBy: { stock: 'asc' },
            take: limit,
        });
    }

    async getRecentMovements(limit = 10) {
        return this.prisma.stockMovement.findMany({
            include: {
                product: true,
                user: { select: { email: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async getMovementsByMonth() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const movements = await this.prisma.stockMovement.findMany({
            where: {
                createdAt: { gte: sixMonthsAgo },
            },
            orderBy: { createdAt: 'asc' },
        });

        // Group by month
        const monthlyData: { [key: string]: number } = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        movements.forEach((movement) => {
            const date = new Date(movement.createdAt);
            const monthKey = months[date.getMonth()];
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }
            monthlyData[monthKey] += movement.quantity;
        });

        return Object.entries(monthlyData).map(([month, value]) => ({ month, value }));
    }
}
