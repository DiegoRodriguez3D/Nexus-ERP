import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      include: { category: true },
    });
  }

  async findOne(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string): Promise<Product> {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
