import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { FieldStatus, FieldType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class CreateFieldDto {
  @ApiProperty({ example: "Sân 5A" })
  @IsString()
  @IsNotEmpty({ message: "Tên sân không được để trống" })
  name!: string;

  @ApiProperty({ enum: FieldType, example: FieldType.SAN_5 })
  @IsEnum(FieldType, { message: "Loại sân phải là SAN_5 hoặc SAN_7" })
  fieldType!: FieldType;

  @ApiPropertyOptional({ enum: FieldStatus, default: FieldStatus.ACTIVE })
  @IsOptional()
  @IsEnum(FieldStatus, { message: "Trạng thái phải là ACTIVE, MAINTENANCE hoặc INACTIVE" })
  status?: FieldStatus;

  @ApiPropertyOptional({ example: "Sân cỏ nhân tạo chất lượng cao" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "https://example.com/pitch5a.jpg" })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: "Phường Tân Tiến" })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({ example: "2 Nguyễn Công Trứ, Buôn Ma Thuột" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: "0262 3857 805" })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateFieldDto {
  @ApiPropertyOptional({ example: "Sân 5A VIP" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: FieldType })
  @IsOptional()
  @IsEnum(FieldType)
  fieldType?: FieldType;

  @ApiPropertyOptional({ enum: FieldStatus })
  @IsOptional()
  @IsEnum(FieldStatus)
  status?: FieldStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}

export class FieldQueryDto {
  @ApiPropertyOptional({ enum: FieldType })
  @IsOptional()
  @IsEnum(FieldType)
  fieldType?: FieldType;

  @ApiPropertyOptional({ enum: FieldStatus })
  @IsOptional()
  @IsEnum(FieldStatus)
  status?: FieldStatus;

  @ApiPropertyOptional({ example: "Phường Tân Tiến" })
  @IsOptional()
  @IsString()
  ward?: string;
}

export class CreateFieldBookingDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: "Mã khung giờ không được để trống" })
  timeSlotId!: number;

  @ApiProperty({ example: "2026-11-02" })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "Ngày đặt sân phải có định dạng YYYY-MM-DD" })
  bookingDate!: string;

  @ApiProperty({ example: "Nguyễn Văn A" })
  @IsString()
  @IsNotEmpty({ message: "Tên khách hàng không được để trống" })
  customerName!: string;

  @ApiProperty({ example: "0901234567" })
  @IsString()
  @IsNotEmpty({ message: "Số điện thoại không được để trống" })
  customerPhone!: string;
}

