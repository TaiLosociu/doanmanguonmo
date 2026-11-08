import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { Skill } from '../entities/skill.entity';
import { Project } from '../entities/project.entity';
import { Experience } from '../entities/experience.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Experience)
    private readonly experienceRepo: Repository<Experience>,
  ) {}

  async onModuleInit() {
    await this.seedData();
  }

  async seedData() {
    const profileCount = await this.profileRepo.count();
    if (profileCount === 0) {
      this.logger.log('Khởi tạo dữ liệu mẫu cho Profile Lê Duy Tài...');
      await this.profileRepo.save({
        fullName: 'Lê Duy Tài',
        title: 'Software Engineer & Full-stack Developer',
        bio: 'Sinh viên ngành Công nghệ Thông tin (Lớp IT24M) sinh ngày 23/04/2006 tại Đắk Lắk. Đam mê kỹ thuật phần mềm, kiến trúc hệ thống phân tán, tối ưu hóa cơ sở dữ liệu quan hệ (Neon Serverless PostgreSQL, MySQL) và xây dựng ứng dụng web hiệu năng cao với Next.js và NestJS. Luôn chủ động học hỏi, rèn luyện tư duy logic và tạo ra những sản phẩm thực tế có giá trị cao.',
        email: 'huavanhen456@gmail.com',
        phone: '0896890399',
        location: 'Buôn Ma Thuột, Đắk Lắk, Việt Nam',
        birthDate: '23/04/2006',
        nickname: 'leduytai.dev',
        currentOccupation: 'Sinh viên CNTT (Lớp IT24M - dak.edu.vn)',
        avatarUrl: '/avatar.svg',
        githubUrl: 'https://github.com/leduytai',
        linkedinUrl: 'https://linkedin.com/in/leduytai',
        yearsExperience: '2+',
        completedProjects: 12,
        happyClients: 25,
      });
      this.logger.log('✅ Đã tạo Profile cho Lê Duy Tài');
    }
  }
}
