import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAssistanceMessage } from '@/entities/ai_assistance_message.entity';
import { AiAssistanceSession } from '@/entities/ai_assistance_session.entity';
import { Question } from '@/entities/question.entity';
import { AiAssistanceMessageService } from './ai_assistance_message.service';
import { AiAssistanceMessageValidator } from './ai_assistance_message.validator';
import { AiAssistanceMessageController } from './ai_assistance_message.controller';
import { AiAssistanceSessionModule } from '@/modules/ai_assistance_session/ai_assistance_session.module';
import { SharedModule } from '@/shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([AiAssistanceMessage, AiAssistanceSession, Question]), AiAssistanceSessionModule, SharedModule],
  controllers: [AiAssistanceMessageController],
  providers: [AiAssistanceMessageService, AiAssistanceMessageValidator],
  exports: [AiAssistanceMessageService],
})
export class AiAssistanceMessageModule {}
