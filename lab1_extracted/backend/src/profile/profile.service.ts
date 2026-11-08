import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {}

  async getProfile(): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: {},
      order: { id: 'ASC' },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    const profile = await this.getProfile();
    Object.assign(profile, data);
    return this.profileRepo.save(profile);
  }
}

