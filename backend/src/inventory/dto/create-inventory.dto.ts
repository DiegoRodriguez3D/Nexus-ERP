import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
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

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsUUID()
    userId?: string; // Optional, will be set from token if not provided
}
