import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('experiences')
export class Experience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  role: string;

  @Column({ length: 150 })
  company: string;

  @Column({ length: 100 })
  period: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', default: 0 })
  order: number;
}

