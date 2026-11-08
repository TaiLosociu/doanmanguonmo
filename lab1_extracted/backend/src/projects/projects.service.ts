import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectRepo.find({
      order: { featured: 'DESC', id: 'ASC' },
    });
  }

  async create(data: Partial<Project>): Promise<Project> {
    const project = this.projectRepo.create(data);
    return this.projectRepo.save(project);
  }

  async remove(id: number): Promise<void> {
    await this.projectRepo.delete(id);
  }
}

