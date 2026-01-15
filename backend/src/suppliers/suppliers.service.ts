import { Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) { }

  create(createSupplierDto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: createSupplierDto });
  }

  findAll() {
    return this.prisma.supplier.findMany({
      include: { products: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: { products: true },
    });
  }

  update(id: string, updateSupplierDto: UpdateSupplierDto) {
    return this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  remove(id: string) {
    return this.prisma.supplier.delete({ where: { id } });
  }
}
