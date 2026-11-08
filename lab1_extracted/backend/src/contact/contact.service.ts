import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../entities/contact-message.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepo: Repository<ContactMessage>,
  ) {}

  async create(dto: CreateContactDto): Promise<ContactMessage> {
    const contact = this.contactRepo.create(dto);
    return this.contactRepo.save(contact);
  }

  async findAll(): Promise<ContactMessage[]> {
    return this.contactRepo.find({
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
}

