import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAnswer } from '@/entities/user_answer.entity';
import { UserAnswerService } from './user_answer.service';
import { UserAnswerController } from './user_answer.controller';
import { QuestionOptionModule } from '@/question_option/question_option.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserAnswer]), QuestionOptionModule],
  controllers: [UserAnswerController],
  providers: [UserAnswerService],
  exports: [UserAnswerService],
})
export class UserAnswerModule {}
