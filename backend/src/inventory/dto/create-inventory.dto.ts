import { IsEnum, IsInt, IsNotEmpty, IsPositive, IsString, IsUUID } from 'class-validator';
import { MovementType } from '@prisma/client';

export class CreateInventoryDto {
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @IsEnum(MovementType)
    @IsNotEmpty()
    type: MovementType;

    @IsInt()
    @IsPositive()
    quantity: number;

    @IsUUID()
    @IsNotEmpty()
    userId: string; // Temporarily passed manually, later from JWT
}
