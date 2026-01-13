import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MovementType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createInventoryDto: CreateInventoryDto) {
    const { productId, type, quantity, userId } = createInventoryDto;

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

      // Update product stock
      await prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      // Create movement record
      return prisma.stockMovement.create({
        data: {
          productId,
          userId,
          type,
          quantity,
        },
      });
    });
  }

  findAll() {
    return this.prisma.stockMovement.findMany({
      include: {
        product: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.stockMovement.findUnique({ where: { id } });
  }

  // Movements shouldn't be updated/deleted ideally for audit purposes, but keeping stubs
  update(id: string, updateInventoryDto: UpdateInventoryDto) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: string) {
    return `This action removes a #${id} inventory`;
  }
}
