import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiAssistanceService } from './ai_assistance.service';
import { OpenAiProvider } from './providers/openai.provider';
import { AI_PROVIDER_TOKEN } from './interfaces/ai-provider.interface';
import { AiAssistanceController } from './ai_assistance.controller';
import { UserAnswerModule } from '@/modules/user_answer/user_answer.module';
import { AiAssistanceMessageModule } from '@/modules/ai_assistance_message/ai_assistance_message.module';

@Module({
  imports: [ConfigModule, UserAnswerModule, AiAssistanceMessageModule],
  controllers: [AiAssistanceController],
  providers: [
    AiAssistanceService,
    {
      provide: AI_PROVIDER_TOKEN,
      useClass: OpenAiProvider,
    },
  ],
  exports: [AiAssistanceService],
})
export class AiAssistanceModule {}
