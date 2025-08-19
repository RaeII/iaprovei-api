import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '@/entities/question.entity';
import { UserAnswer } from '@/entities/user_answer.entity';
import { SkillCategory } from '@/entities/skill_category.entity';
import { QuestionStatementText } from '@/entities/question_statement_text.entity';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

@Module({
  imports: [TypeOrmModule.forFeature([Question, UserAnswer, SkillCategory, QuestionStatementText])],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
