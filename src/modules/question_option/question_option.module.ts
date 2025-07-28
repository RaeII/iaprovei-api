import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionOption } from '@/entities/question_option.entity';
import { UserAnswer } from '@/entities/user_answer.entity';
import { QuestionOptionController } from './question_option.controller';
import { QuestionOptionService } from './question_option.service';
import { AnsweredQuestionGuard } from './guard/answered-question.guard';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionOption, UserAnswer])],
  controllers: [QuestionOptionController],
  providers: [QuestionOptionService, AnsweredQuestionGuard],
  exports: [QuestionOptionService],
})
export class QuestionOptionModule {}
