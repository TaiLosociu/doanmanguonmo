import { IsNotEmpty, IsEmail, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsNotEmpty()
  @MaxLength(150)
  subject: string;

  @IsNotEmpty()
  message: string;
}

