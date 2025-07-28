import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAnswer } from '@/entities/user_answer.entity';
import { UserAnswerService } from './user_answer.service';
import { UserAnswerController } from './user_answer.controller';
import { QuestionOptionModule } from '@/modules/question_option/question_option.module';
import { QuestionModule } from '@/modules/question/question.module';
import { ContestModule } from '@/modules/contest/contest.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserAnswer]), QuestionOptionModule, QuestionModule, ContestModule],
  controllers: [UserAnswerController],
  providers: [UserAnswerService],
  exports: [UserAnswerService],
})
export class UserAnswerModule {}
