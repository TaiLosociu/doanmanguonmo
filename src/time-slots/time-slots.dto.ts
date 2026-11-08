import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class CreateTimeSlotDto {
  @ApiPropertyOptional({ example: "06:00 - 07:30" })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ example: "06:00" })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Giờ bắt đầu phải có định dạng HH:mm" })
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({ example: "07:30" })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Giờ kết thúc phải có định dạng HH:mm" })
  @IsNotEmpty()
  endTime!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPeakHour?: boolean;
}

