import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { Experience } from '../entities/experience.entity';

@Controller('api/experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Get()
  async findAll(): Promise<Experience[]> {
    return this.experiencesService.findAll();
  }

  @Post()
  async create(@Body() data: Partial<Experience>): Promise<Experience> {
    return this.experiencesService.create(data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.experiencesService.remove(id);
    return { success: true };
  }
}

