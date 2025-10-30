import { Controller, Get, UseGuards } from '@nestjs/common';
import { PagbankService } from './pagbank.service';
import { PublicKeysResponse, publicKeysResponseOpenapi } from './schemas/pagbank.schema';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
import { Role } from '@/modules/auth/enums/role.enum';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('pagbank')
@ApiBearerAuth()
export class PagbankController {
  constructor(private readonly pagbankService: PagbankService) {}

  @Get('public-keys')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: publicKeysResponseOpenapi })
  async GetPublicKeys(): Promise<PublicKeysResponse> {
    const data = await this.pagbankService.GetPublicKeys();
    return { data };
  }
}
