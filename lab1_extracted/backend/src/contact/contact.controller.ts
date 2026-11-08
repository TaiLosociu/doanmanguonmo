import { Controller, Get, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactMessage } from '../entities/contact-message.entity';

@Controller('api/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() dto: CreateContactDto): Promise<{ success: boolean; message: string; data: ContactMessage }> {
    const data = await this.contactService.create(dto);
    return {
      success: true,
      message: 'Tin nhắn của bạn đã được lưu vào CSDL Neon thành công!',
      data,
    };
  }

  @Get()
  async findAll(): Promise<ContactMessage[]> {
    return this.contactService.findAll();
  }
}

