import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Profile } from '../entities/profile.entity';

@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(): Promise<Profile> {
    return this.profileService.getProfile();
  }

  @Patch()
  async updateProfile(@Body() data: Partial<Profile>): Promise<Profile> {
    return this.profileService.updateProfile(data);
  }
}

