import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlanValidator } from './plans.validator';
import {
  PlanListResponse,
  PlanDetailResponse,
  PlanCreate,
  PlanUpdate,
  PlanCreateSchema,
  PlanUpdateSchema,
  planListResponseOpenapi,
  planDetailResponseOpenapi,
  planCreateOpenapi,
  planUpdateOpenapi,
} from './schemas/plan.schema';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
import { Role } from '@/modules/auth/enums/role.enum';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Plans')
@Controller('plans')
@ApiBearerAuth()
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly planValidator: PlanValidator
  ) {}

  @Get()
  @ApiResponse({ schema: planListResponseOpenapi })
  async findAll(): Promise<PlanListResponse> {
    return { data: await this.plansService.findAll() };
  }

  @Get('active')
  @ApiResponse({ schema: planListResponseOpenapi })
  async findAllActive(): Promise<PlanListResponse> {
    return { data: await this.plansService.findAllActive() };
  }

  @Get(':id')
  @ApiResponse({ schema: planDetailResponseOpenapi })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PlanDetailResponse> {
    return { data: await this.plansService.findOne(id) };
  }

  @Get(':id/active')
  @ApiResponse({ schema: planDetailResponseOpenapi })
  async findOneActive(@Param('id', ParseIntPipe) id: number): Promise<PlanDetailResponse> {
    return { data: await this.plansService.findOneActive(id) };
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBody({ schema: planCreateOpenapi })
  @ApiResponse({ schema: planDetailResponseOpenapi })
  @ApiResponse({ status: 201, description: 'Plano criado com sucesso' })
  async create(@Body(new ZodValidationPipe(PlanCreateSchema)) createPlanDto: PlanCreate): Promise<PlanDetailResponse> {
    // Validações antes da criação
    await this.planValidator.assertIdPagbankIsNotAlreadyInUse(createPlanDto.id_pagbank);

    const plan = await this.plansService.create(createPlanDto);
    return { data: plan };
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBody({ schema: planUpdateOpenapi })
  @ApiResponse({ schema: planDetailResponseOpenapi })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(PlanUpdateSchema)) updatePlanDto: PlanUpdate
  ): Promise<PlanDetailResponse> {
    // Verifica se o plano existe
    await this.planValidator.assertPlanExists(id);

    // Validações condicionais
    if (updatePlanDto.id_pagbank) {
      await this.planValidator.assertIdPagbankIsNotAlreadyInUse(updatePlanDto.id_pagbank, id);
    }

    const plan = await this.plansService.update(id, updatePlanDto);
    return { data: plan };
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.planValidator.assertPlanExists(id);
    return this.plansService.remove(id);
  }
}
