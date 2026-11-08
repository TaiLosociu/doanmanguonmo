import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "admin@example.com", description: "Email hoặc số điện thoại" })
  @IsString()
  @IsNotEmpty({ message: "Email hoặc số điện thoại không được để trống" })
  email!: string;

  @ApiProperty({ example: "Admin@123456" })
  @IsString()
  @IsNotEmpty({ message: "Mật khẩu không được để trống" })
  password!: string;
}

export class RegisterDto {
  @ApiProperty({ example: "Nguyễn Văn A" })
  @IsString()
  @MinLength(2, { message: "Họ tên phải từ 2 ký tự" })
  fullName!: string;

  @ApiProperty({ example: "0901234567" })
  @IsString()
  @IsNotEmpty({ message: "Số điện thoại không được để trống" })
  phone!: string;

  @ApiPropertyOptional({ example: "customer@example.com" })
  @IsOptional()
  @IsEmail({}, { message: "Email không đúng định dạng" })
  email?: string;

  @ApiProperty({ example: "Password@123" })
  @IsString()
  @MinLength(6, { message: "Mật khẩu tối thiểu 6 ký tự" })
  password!: string;
}
