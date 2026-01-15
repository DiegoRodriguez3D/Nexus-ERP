import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MovementType } from '@prisma/client';

interface FindAllOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) { }

  async getDefaultUser() {
    return this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
  }

  async create(createInventoryDto: CreateInventoryDto) {
    const { productId, type, quantity, userId, notes } = createInventoryDto;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.prisma.$transaction(async (prisma) => {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new BadRequestException('Product not found');
      }

      let newStock = product.stock;

      if (type === MovementType.IN) {
        newStock += quantity;
      } else if (type === MovementType.OUT) {
        if (product.stock < quantity) {
          throw new BadRequestException(`Insufficient stock. Current: ${product.stock}, Requested: ${quantity}`);
        }
        newStock -= quantity;
      }

      await prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      return prisma.stockMovement.create({
        data: {
          productId,
          userId,
          type,
          quantity,
          notes,
        },
        include: { product: true, user: true },
      });
    });
  }

  async findAll(options: FindAllOptions = {}) {
    const { page = 1, limit = 20, search, type } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type && (type === 'IN' || type === 'OUT')) {
      where.type = type;
    }
    if (search) {
      where.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: { product: true, user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: string) {
    return this.prisma.stockMovement.findUnique({ where: { id }, include: { product: true, user: true } });
  }

  update(id: string, updateInventoryDto: UpdateInventoryDto) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: string) {
    return `This action removes a #${id} inventory`;
  }
}
