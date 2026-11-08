import { ApiPropertyOptional } from "@nestjs/swagger";
import { InvoiceStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class InvoiceQueryDto {
  @ApiPropertyOptional({ example: "2026-10-31" })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ example: "HD-..." })
  @IsOptional()
  @IsString()
  invoiceCode?: string;
}

