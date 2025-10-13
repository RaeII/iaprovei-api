import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyTrail } from '@/entities/study_trail.entity';
import { StudyTrailStop } from '@/entities/study_trail_stop.entity';
import { StudyTrailStopQuestion } from '@/entities/study_trail_stop_question.entity';
import { StudyTrailPerformance } from '@/entities/study_trail_performance.entity';
import { Question } from '@/entities/question.entity';
import { Subject } from '@/entities/subject.entity';
import { SkillCategory } from '@/entities/skill_category.entity';
import { User } from '@/entities/user.entity';
import { AiAssistanceModule } from '@/modules/ai_assistance/ai_assistance.module';
import { StudyTrailController } from './study_trail.controller';
import { StudyTrailService } from './study_trail.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudyTrail, StudyTrailStop, StudyTrailStopQuestion, StudyTrailPerformance, Question, Subject, SkillCategory, User]), AiAssistanceModule],
  controllers: [StudyTrailController],
  providers: [StudyTrailService],
  exports: [StudyTrailService],
})
export class StudyTrailModule {}
