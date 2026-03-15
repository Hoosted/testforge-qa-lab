import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { healthcheck, type Healthcheck } from '@testforge/shared-types';

@ApiTags('health')
@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  @Get()
  @ApiOkResponse({
    description: 'Returns the API bootstrap health status.',
  })
  getHealth(): Healthcheck {
    return {
      ...healthcheck,
      timestamp: new Date().toISOString(),
    };
  }
}
