import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 150 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

