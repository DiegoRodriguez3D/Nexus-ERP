import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    sku: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsPositive()
    price: number;

    @IsInt()
    @Min(0)
    stock: number;

    @IsString()
    @IsUUID()
    categoryId: string;
}
