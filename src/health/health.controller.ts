import { Controller, Get } from '@nestjs/common';
import { res } from '../common/utils/res.util';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    const data = await this.healthService.check();
    return res.ok(data);
  }
}
