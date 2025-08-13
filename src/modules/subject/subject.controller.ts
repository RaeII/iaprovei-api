import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { SubjectService } from './subject.service';
import { SubjectSummary, SubjectDetails, SubjectCreate, SubjectUpdate, SubjectCreateSchema, SubjectUpdateSchema, subjectSummaryOpenapi, subjectDetailsOpenapi, subjectCreateOpenapi, subjectUpdateOpenapi } from './schemas/subject.schema';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';

@ApiTags('Subjects')
@Controller('subject')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  @ApiResponse({ schema: { type: 'array', items: subjectSummaryOpenapi } })
  async findAll(): Promise<SubjectSummary[]> {
    return this.subjectService.findAll();
  }

  @Get('contest/:contestId')
  @ApiResponse({ schema: { type: 'array', items: subjectSummaryOpenapi } })
  async findByContestId(@Param('contestId') contestId: number): Promise<SubjectSummary[]> {
    return this.subjectService.findByContestId(contestId);
  }

  @Get(':id')
  @ApiResponse({ schema: subjectDetailsOpenapi })
  async findById(@Param('id') id: number): Promise<SubjectDetails | null> {
    return this.subjectService.findById(id);
  }

  @Get('slug/:slug')
  @ApiResponse({ schema: subjectDetailsOpenapi })
  async findBySlug(@Param('slug') slug: string): Promise<SubjectDetails | null> {
    return this.subjectService.findBySlug(slug);
  }

  @Post()
  @ApiBody({ schema: subjectCreateOpenapi })
  @ApiResponse({ schema: subjectDetailsOpenapi })
  async create(@Body(new ZodValidationPipe(SubjectCreateSchema)) createData: SubjectCreate): Promise<SubjectDetails> {
    return this.subjectService.create(createData);
  }

  @Put(':id')
  @ApiBody({ schema: subjectUpdateOpenapi })
  @ApiResponse({ schema: subjectDetailsOpenapi })
  async update(@Param('id') id: number, @Body(new ZodValidationPipe(SubjectUpdateSchema)) updateData: SubjectUpdate): Promise<SubjectDetails | null> {
    return this.subjectService.update(id, updateData);
  }

  @Delete(':id')
  @ApiResponse({ schema: { type: 'boolean' } })
  async delete(@Param('id') id: number): Promise<boolean> {
    return this.subjectService.delete(id);
  }
}
