import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { JwtModule } from '@/modules/jwt/jwt.module';
import databaseConfig from '@/config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OverallFilterProvider } from '@/common/filters/overall-filter.filter';
import { ZodValidationPipe } from 'nestjs-zod';
import { ContestModule } from './modules/contest/contest.module';
import { SubjectModule } from './modules/subject/subject.module';
import { QuestionModule } from './modules/question/question.module';
import { QuestionOptionModule } from './modules/question_option/question_option.module';
import { UserAnswerModule } from './modules/user_answer/user_answer.module';
import { AiAssistanceSessionModule } from './modules/ai_assistance_session/ai_assistance_session.module';
import { AiAssistanceMessageModule } from './modules/ai_assistance_message/ai_assistance_message.module';
import { AiAssistanceModule } from './modules/ai_assistance/ai_assistance.module';
import { SharedModule } from './shared/shared.module';
import openaiConfig from './config/openai.config';
import { GlobalOptionsController } from './global-options.controller';
import { SkillCategoryModule } from './modules/skill_category/skill_category.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { StudyTrailModule } from './modules/study_trail/study_trail.module';
import { HeartsModule } from './modules/hearts/hearts.module';

@Module({
  controllers: [GlobalOptionsController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, openaiConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get('DATABASE_CON'),
    }),
    AuthModule,
    UserModule,
    JwtModule,
    ContestModule,
    SubjectModule,
    QuestionModule,
    QuestionOptionModule,
    UserAnswerModule,
    AiAssistanceSessionModule,
    AiAssistanceMessageModule,
    AiAssistanceModule,
    SharedModule,
    SkillCategoryModule,
    StatisticsModule,
    StudyTrailModule,
    HeartsModule,
  ],
  providers: [
    OverallFilterProvider,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
