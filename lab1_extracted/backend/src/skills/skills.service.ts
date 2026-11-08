import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
  ) {}

  async findAll(): Promise<Skill[]> {
    return this.skillRepo.find({
      order: { id: 'ASC' },
    });
  }

  async create(data: Partial<Skill>): Promise<Skill> {
    const skill = this.skillRepo.create(data);
    return this.skillRepo.save(skill);
  }

  async remove(id: number): Promise<void> {
    await this.skillRepo.delete(id);
  }
}

