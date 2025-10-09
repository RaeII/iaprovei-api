/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { StudyTrailService } from './study_trail.service';
import { StudyTrailCreate, StudyTrailUpdate, StudyTrailStopStart, StudyTrailStopAnswer, StudyTrailCreateSchema, StudyTrailUpdateSchema, StudyTrailStopStartSchema, StudyTrailStopAnswerSchema } from './schemas/study_trail.schema';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
import { BasicUserInfo } from '@/common/decorators';

@ApiTags('Study Trails')
@Controller('study-trails')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudyTrailController {
  constructor(private readonly studyTrailService: StudyTrailService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova trilha de estudos' })
  @ApiResponse({
    status: 201,
    description: 'Trilha de estudos criada com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou trilha já existe' })
  @ApiResponse({ status: 404, description: 'Matéria não encontrada' })
  async createStudyTrail(@BasicUserInfo() userInfo: any, @Body(new ZodValidationPipe(StudyTrailCreateSchema)) createData: StudyTrailCreate) {
    return this.studyTrailService.createStudyTrail(userInfo.id, createData);
  }

  @Get()
  @ApiOperation({ summary: 'Listar trilhas de estudos do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de trilhas de estudos do usuário',
  })
  async getUserStudyTrails(@BasicUserInfo() userInfo: any) {
    return this.studyTrailService.getUserStudyTrails(userInfo.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma trilha de estudos' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da trilha de estudos',
  })
  @ApiResponse({ status: 404, description: 'Trilha de estudos não encontrada' })
  async getStudyTrailDetails(@Param('id', ParseIntPipe) trailId: number, @BasicUserInfo() userInfo: any) {
    return this.studyTrailService.getStudyTrailDetails(trailId, userInfo.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar trilha de estudos' })
  @ApiResponse({
    status: 200,
    description: 'Trilha de estudos atualizada com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Trilha de estudos não encontrada' })
  async updateStudyTrail(@Param('id', ParseIntPipe) trailId: number, @BasicUserInfo() userInfo: any, @Body(new ZodValidationPipe(StudyTrailUpdateSchema)) updateData: StudyTrailUpdate) {
    // TODO: Implementar método de atualização no service
    throw new Error('Método não implementado ainda');
  }

  @Post('stops/start')
  @ApiOperation({ summary: 'Iniciar uma parada da trilha de estudos' })
  @ApiResponse({
    status: 200,
    description: 'Parada iniciada com sucesso, retorna questões da parada',
  })
  @ApiResponse({ status: 403, description: 'Parada ainda está bloqueada' })
  @ApiResponse({ status: 404, description: 'Trilha de estudos não encontrada' })
  async startStudyTrailStop(@BasicUserInfo() userInfo: any, @Body(new ZodValidationPipe(StudyTrailStopStartSchema)) startData: StudyTrailStopStart) {
    return this.studyTrailService.startStudyTrailStop(userInfo.id, startData);
  }

  @Post('questions/answer')
  @ApiOperation({ summary: 'Responder uma questão da trilha de estudos' })
  @ApiResponse({
    status: 200,
    description: 'Resposta processada com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Questão já foi respondida' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  async answerQuestion(@BasicUserInfo() userInfo: any, @Body(new ZodValidationPipe(StudyTrailStopAnswerSchema)) answerData: StudyTrailStopAnswer) {
    return this.studyTrailService.answerQuestion(userInfo.id, answerData);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Obter progresso atual da trilha de estudos' })
  @ApiResponse({
    status: 200,
    description: 'Progresso atual da trilha de estudos',
  })
  @ApiResponse({ status: 404, description: 'Trilha de estudos não encontrada' })
  async getStudyTrailProgress(@Param('id', ParseIntPipe) trailId: number, @BasicUserInfo() userInfo: any) {
    // TODO: Implementar método de progresso no service
    throw new Error('Método não implementado ainda');
  }

  @Get('stops/:stopId/performance')
  @ApiOperation({ summary: 'Obter performance detalhada de uma parada' })
  @ApiResponse({
    status: 200,
    description: 'Performance da parada obtida com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Parada não encontrada' })
  async getStopPerformance(@Param('stopId', ParseIntPipe) stopId: number, @BasicUserInfo() userInfo: any) {
    return this.studyTrailService.getStopPerformance(stopId, userInfo.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir trilha de estudos' })
  @ApiResponse({
    status: 200,
    description: 'Trilha de estudos excluída com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Trilha de estudos não encontrada' })
  async deleteStudyTrail(@Param('id', ParseIntPipe) trailId: number, @BasicUserInfo() userInfo: any) {
    // TODO: Implementar método de exclusão no service
    throw new Error('Método não implementado ainda');
  }
}
