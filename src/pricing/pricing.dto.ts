import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DayType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsOptional, Min } from "class-validator";

export class CreatePriceRuleDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  fieldId!: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  timeSlotId!: number;

  @ApiProperty({ enum: DayType, example: DayType.WEEKDAY })
  @IsEnum(DayType, { message: "Loại ngày phải là WEEKDAY hoặc WEEKEND" })
  dayType!: DayType;

  @ApiProperty({ example: 300000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: "Giá thuê không được âm" })
  price!: number;
}

export class PriceRuleQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fieldId?: number;

  @ApiPropertyOptional({ enum: DayType })
  @IsOptional()
  @IsEnum(DayType)
  dayType?: DayType;
}

