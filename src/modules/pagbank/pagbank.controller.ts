import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { PagbankService } from './pagbank.service';
import { PublicKeysResponse, publicKeysResponseOpenapi, CreatePlan, CreatePlanResponse, createPlanOpenapi, createPlanResponseOpenapi, CreatePlanSchema } from './schemas/pagbank.schema';
import { ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
//import { RolesGuard } from '@/modules/auth/guard/roles.guard';
import { Role } from '@/modules/auth/enums/role.enum';
import { Roles } from '@/common/decorators/roles.decorator';
import { ZodValidationPipe } from 'nestjs-zod';

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

  @Post('plans')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBody({ schema: createPlanOpenapi })
  @ApiResponse({ schema: createPlanResponseOpenapi })
  async createPlan(@Body(new ZodValidationPipe(CreatePlanSchema)) createPlanDto: CreatePlan): Promise<CreatePlanResponse> {
    const data = await this.pagbankService.createPlan(createPlanDto);
    return { data };
  }
}
