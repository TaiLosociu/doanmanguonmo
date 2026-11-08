import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../entities/profile.entity';
import { Skill } from '../entities/skill.entity';
import { Project } from '../entities/project.entity';
import { Experience } from '../entities/experience.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, Skill, Project, Experience])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}

