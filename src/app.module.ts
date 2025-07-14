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
  ],
  providers: [
    OverallFilterProvider,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
  controllers: [],
})
export class AppModule {}
