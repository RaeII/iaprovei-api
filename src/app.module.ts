import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '@/auth/auth.module';
import { CommonModule } from '@/common/common.module';
import { UserModule } from '@/user/user.module';
import { JwtModule } from '@/jwt/jwt.module';
import databaseConfig from '@/config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OverallFilterProvider } from '@/infra/filter/overall-filter.filter';
import { ZodValidationPipe } from 'nestjs-zod';
import { ContestModule } from './contest/contest.module';
import { SubjectModule } from './subject/subject.module';
import { QuestionModule } from './question/question.module';
import { QuestionOptionModule } from './question_option/question_option.module';
import { UserAnswerModule } from './user_answer/user_answer.module';
import { AiAssistanceSessionModule } from './ai_assistance_session/ai_assistance_session.module';
import { AiAssistanceMessageModule } from './ai_assistance_message/ai_assistance_message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get('DATABASE_CON'),
    }),
    AuthModule,
    CommonModule,
    UserModule,
    JwtModule,
    ContestModule,
    SubjectModule,
    QuestionModule,
    QuestionOptionModule,
    UserAnswerModule,
    AiAssistanceSessionModule,
    AiAssistanceMessageModule,
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
