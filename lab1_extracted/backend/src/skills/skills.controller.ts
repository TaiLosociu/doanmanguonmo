import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { Skill } from '../entities/skill.entity';

@Controller('api/skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async findAll(): Promise<Skill[]> {
    return this.skillsService.findAll();
  }

  @Post()
  async create(@Body() data: Partial<Skill>): Promise<Skill> {
    return this.skillsService.create(data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.skillsService.remove(id);
    return { success: true };
  }
}

