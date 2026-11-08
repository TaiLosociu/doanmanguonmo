import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentMethod } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: "Mã hóa đơn phải là số nguyên" })
  invoiceId!: number;

  @ApiProperty({ example: 300000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: "Số tiền thanh toán phải lớn hơn hoặc bằng 0" })
  amount!: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod, { message: "Phương thức thanh toán phải là CASH hoặc TRANSFER" })
  method!: PaymentMethod;

  @ApiPropertyOptional({ example: "VCB123456789" })
  @IsOptional()
  @IsString()
  referenceCode?: string;
}

export class PaymentQueryDto {
  @ApiPropertyOptional({ example: "2026-10-31" })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}

