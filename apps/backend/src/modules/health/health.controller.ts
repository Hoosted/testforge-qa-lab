import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Checks API and database health' })
  @ApiOkResponse({
    description: 'Returns the API and database health status.',
    type: HealthResponseDto,
  })
  getHealth() {
    return this.healthService.getStatus();
  }
}
