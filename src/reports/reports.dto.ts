import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

export class RevenueQueryDto {
  @ApiPropertyOptional({ example: "2026-10-31", description: "Ngày báo cáo (YYYY-MM-DD)" })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "Ngày phải có định dạng YYYY-MM-DD" })
  date?: string;

  @ApiPropertyOptional({ example: "2026-10-01", description: "Ngày bắt đầu (YYYY-MM-DD)" })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "Từ ngày phải có định dạng YYYY-MM-DD" })
  from?: string;

  @ApiPropertyOptional({ example: "2026-10-31", description: "Ngày kết thúc (YYYY-MM-DD)" })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "Đến ngày phải có định dạng YYYY-MM-DD" })
  to?: string;
}

