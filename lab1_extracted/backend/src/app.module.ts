import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { Profile } from './entities/profile.entity';
import { Skill } from './entities/skill.entity';
import { Project } from './entities/project.entity';
import { Experience } from './entities/experience.entity';
import { ContactMessage } from './entities/contact-message.entity';
import { ProfileModule } from './profile/profile.module';
import { SkillsModule } from './skills/skills.module';
import { ProjectsModule } from './projects/projects.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { ContactModule } from './contact/contact.module';
import { HealthModule } from './health/health.module';
import { SeedModule } from './seed/seed.module';

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_YUtqghBP38Zf@ep-wispy-hall-b4rtt92m-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [Profile, Skill, Project, Experience, ContactMessage],
      synchronize: true, // Auto-create tables in Neon PostgreSQL
    }),
    ProfileModule,
    SkillsModule,
    ProjectsModule,
    ExperiencesModule,
    ContactModule,
    HealthModule,
    SeedModule,
  ],
})
export class AppModule {}

