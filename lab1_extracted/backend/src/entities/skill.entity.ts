import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  category: string; // 'Frontend' | 'Backend' | 'Database' | 'DevOps & Tools'

  @Column({ type: 'int', default: 80 })
  proficiency: number; // 0 - 100

  @Column({ length: 50, nullable: true })
  icon: string; // e.g. '⚡', '💻', '🗄️', '🛠️'
}

