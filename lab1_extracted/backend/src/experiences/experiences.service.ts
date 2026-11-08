import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experience } from '../entities/experience.entity';

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectRepository(Experience)
    private readonly experienceRepo: Repository<Experience>,
  ) {}

  async findAll(): Promise<Experience[]> {
    return this.experienceRepo.find({
      order: { order: 'ASC', id: 'ASC' },
    });
  }

  async create(data: Partial<Experience>): Promise<Experience> {
    const exp = this.experienceRepo.create(data);
    return this.experienceRepo.save(exp);
  }

  async remove(id: number): Promise<void> {
    await this.experienceRepo.delete(id);
  }
}

