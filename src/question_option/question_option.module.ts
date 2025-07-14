import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionOption } from '@/entities/question_option.entity';
import { QuestionOptionController } from './question_option.controller';
import { QuestionOptionService } from './question_option.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionOption])],
  controllers: [QuestionOptionController],
  providers: [QuestionOptionService],
  exports: [QuestionOptionService],
})
export class QuestionOptionModule {}
