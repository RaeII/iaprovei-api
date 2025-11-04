import { Controller, Get, Post, Put, UseGuards, Body, Param } from '@nestjs/common';
import { PagbankService } from './pagbank.service';
import { PublicKeysResponse, publicKeysResponseOpenapi, CreatePlan, CreatePlanResponse, createPlanOpenapi, createPlanResponseOpenapi, CreatePlanSchema, GetPlansResponse, getPlansResponseOpenapi, CreateCustomer, CreateCustomerResponse, createCustomerOpenapi, createCustomerResponseOpenapi, CreateCustomerSchema } from './schemas/pagbank.schema';
import { ApiBearerAuth, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
//import { RolesGuard } from '@/modules/auth/guard/roles.guard';
import { Role } from '@/modules/auth/enums/role.enum';
import { Roles } from '@/common/decorators/roles.decorator';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('pagbank')
@ApiBearerAuth()
export class PagbankController {
  constructor(private readonly pagbankService: PagbankService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: getPlansResponseOpenapi })
  async getPlans(): Promise<GetPlansResponse> {
    const data = await this.pagbankService.getPlans();
    return { data };
  }

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

  @Put('plans/:plan_id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'plan_id', description: 'ID do plano a ser atualizado', type: 'string' })
  @ApiBody({ schema: createPlanOpenapi })
  @ApiResponse({ schema: createPlanResponseOpenapi })
  async updatePlan(@Param('plan_id') planId: string, @Body(new ZodValidationPipe(CreatePlanSchema)) updatePlanDto: CreatePlan): Promise<CreatePlanResponse> {
    const data = await this.pagbankService.updatePlan(planId, updatePlanDto);
    return { data };
  }

  @Post('customers')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ schema: createCustomerOpenapi })
  @ApiResponse({ schema: createCustomerResponseOpenapi })
  async createCustomer(@Body(new ZodValidationPipe(CreateCustomerSchema)) createCustomerDto: CreateCustomer): Promise<CreateCustomerResponse> {
    const data = await this.pagbankService.createCustomer(createCustomerDto);
    return { data };
  }
}
