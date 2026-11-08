import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('api/health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    const startTime = Date.now();
    let dbStatus = 'disconnected';
    let latencyMs = 0;

    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');
        dbStatus = 'connected';
        latencyMs = Date.now() - startTime;
      }
    } catch (error) {
      dbStatus = 'error: ' + (error as Error).message;
    }

    return {
      status: 'ok',
      service: 'NestJS Landing Page API',
      database: dbStatus,
      latencyMs,
      provider: 'Neon Serverless PostgreSQL (AWS US-East-2)',
      timestamp: new Date().toISOString(),
    };
  }
}

