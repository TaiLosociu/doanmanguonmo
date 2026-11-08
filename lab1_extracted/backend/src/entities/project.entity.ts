import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 255 })
  tags: string; // Comma-separated: "Next.js, NestJS, Neon DB, TypeScript"

  @Column({ name: 'demo_url', length: 255, nullable: true })
  demoUrl: string;

  @Column({ name: 'github_url', length: 255, nullable: true })
  githubUrl: string;

  @Column({ name: 'image_url', length: 255, nullable: true })
  imageUrl: string;

  @Column({ default: false })
  featured: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

