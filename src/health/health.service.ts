import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { res } from '../common/utils/res.util';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
  timestamp: string;
}

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async check(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();

    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', database: 'up', timestamp };
    } catch {
      throw new ServiceUnavailableException(
        res.fail('Service unhealthy', ['Database connection failed']),
      );
    }
  }
}
