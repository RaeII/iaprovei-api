import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HeartsService } from './hearts.service';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
import { BasicUserInfo } from '@/common/decorators';
import { UserBasicInfo } from '@/modules/user/schemas/user.schema';
import { HeartStatusResponse, heartStatusResponseOpenapi } from './schemas/hearts.schema';

@ApiTags('Hearts')
@Controller('hearts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HeartsController {
  constructor(private readonly heartsService: HeartsService) {}

  /**
   * Get current heart status for authenticated user
   * Returns current hearts, max hearts, and regeneration information
   */
  @Get('status')
  @ApiResponse({ schema: heartStatusResponseOpenapi })
  async getHeartStatus(@BasicUserInfo() userInfo: UserBasicInfo): Promise<HeartStatusResponse> {
    const heartStatus = await this.heartsService.getHeartStatus(userInfo.id);
    return { data: heartStatus };
  }
}
