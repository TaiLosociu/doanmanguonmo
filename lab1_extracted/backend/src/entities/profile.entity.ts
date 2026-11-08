import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('profile')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', length: 150 })
  fullName: string;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text' })
  bio: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ name: 'birth_date', length: 50, nullable: true })
  birthDate: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ name: 'current_occupation', length: 150, nullable: true })
  currentOccupation: string;

  @Column({ name: 'avatar_url', length: 255, nullable: true })
  avatarUrl: string;

  @Column({ name: 'github_url', length: 255, nullable: true })
  githubUrl: string;

  @Column({ name: 'linkedin_url', length: 255, nullable: true })
  linkedinUrl: string;

  @Column({ name: 'years_experience', length: 20, default: '2+' })
  yearsExperience: string;

  @Column({ name: 'completed_projects', type: 'int', default: 12 })
  completedProjects: number;

  @Column({ name: 'happy_clients', type: 'int', default: 25 })
  happyClients: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
