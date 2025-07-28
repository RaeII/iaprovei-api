import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAssistanceSession } from '@/entities/ai_assistance_session.entity';
import { User } from '@/entities/user.entity';
import { Question } from '@/entities/question.entity';
import { AiAssistanceSessionService } from './ai_assistance_session.service';
import { AiAssistanceSessionValidator } from './ai_assistance_session.validator';

@Module({
  imports: [TypeOrmModule.forFeature([AiAssistanceSession, User, Question])],
  providers: [AiAssistanceSessionService, AiAssistanceSessionValidator],
  exports: [AiAssistanceSessionService],
})
export class AiAssistanceSessionModule {}
