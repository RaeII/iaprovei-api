import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiAssistantService } from './ai_assistant.service';
import { OpenAiProvider } from './providers/openai.provider';
import { AI_PROVIDER_TOKEN } from './interfaces/ai-provider.interface';
import { AiAssistantController } from './ai_assistant.controller';
import { UserAnswerModule } from '@/user_answer/user_answer.module';
import { AiAssistanceMessageModule } from '@/ai_assistance_message/ai_assistance_message.module';

@Module({
  imports: [ConfigModule, UserAnswerModule, AiAssistanceMessageModule],
  controllers: [AiAssistantController],
  providers: [
    AiAssistantService,
    {
      provide: AI_PROVIDER_TOKEN,
      useClass: OpenAiProvider,
    },
  ],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
