export interface Profile {
  id: number;
  fullName: string;
  title: string;
  bio: string;
  email: string;
  phone?: string;
  location?: string;
  birthDate?: string;
  nickname?: string;
  currentOccupation?: string;
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  yearsExperience: string;
  completedProjects: number;
  happyClients: number;
  updatedAt?: string;
}

export interface Skill {
  id: number;
  name: string;
  category: 'languages-frameworks' | 'databases' | 'tools-methods' | string;
  proficiency: number;
  badge?: string;
  color?: string;
  experience?: string;
  icon?: string;
}

export interface Project {
  id: number | string;
  title: string;
  category?: string;
  badge?: string;
  description: string;
  problemStatement?: string;
  techStack: string[];
  highlights: string[];
  demoUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  featured: boolean;
}

export interface Experience {
  id: number;
  role: string;
  company: string;
  period: string;
  grade?: string;
  description: string;
  details?: string[];
  order: number;
}

export interface ContactMessage {
  id?: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  database: string;
  latencyMs: number;
  provider: string;
  timestamp: string;
}
