import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BookingStatus, FieldType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches, MinLength } from "class-validator";

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: "Mã sân phải là số nguyên" })
  fieldId!: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: "Mã khung giờ phải là số nguyên" })
  timeSlotId!: number;

  @ApiProperty({ example: "2026-10-31" })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "Ngày đặt sân phải có định dạng YYYY-MM-DD" })
  bookingDate!: string;

  @ApiProperty({ example: "Nguyễn Văn A" })
  @IsString()
  @MinLength(2, { message: "Tên khách hàng phải từ 2 ký tự" })
  customerName!: string;

  @ApiProperty({ example: "0901234567" })
  @IsString()
  @IsNotEmpty({ message: "Số điện thoại không được để trống" })
  customerPhone!: string;
}

export class BookingQueryDto {
  @ApiPropertyOptional({ example: "2026-10-31" })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ example: "0901234567" })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ example: "SAN-..." })
  @IsOptional()
  @IsString()
  bookingCode?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fieldId?: number;
}

export class BookingLookupDto {
  @ApiProperty({ example: "SAN-XXXX" })
  @IsString()
  @IsNotEmpty({ message: "Mã đặt sân không được để trống" })
  bookingCode!: string;

  @ApiProperty({ example: "0901234567" })
  @IsString()
  @IsNotEmpty({ message: "Số điện thoại không được để trống" })
  customerPhone!: string;
}

export class CancelBookingDto {
  @ApiPropertyOptional({ example: "0901234567" })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ example: "Có việc bận đột xuất" })
  @IsOptional()
  @IsString()
  cancelReason?: string;
}

export class AvailabilityQueryDto {
  @ApiProperty({ example: "2026-10-31" })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "Ngày kiểm tra phải có định dạng YYYY-MM-DD" })
  date!: string;

  @ApiPropertyOptional({ enum: FieldType })
  @IsOptional()
  @IsEnum(FieldType)
  fieldType?: FieldType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fieldId?: number;

  @ApiPropertyOptional({ example: "Phường Tân Tiến" })
  @IsOptional()
  @IsString()
  ward?: string;
}

