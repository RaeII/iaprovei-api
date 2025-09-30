import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAnswer } from '@/entities/user_answer.entity';
import { Question } from '@/entities/question.entity';
import { SkillCategory } from '@/entities/skill_category.entity';
import { UserStatistics } from '@/entities/user_statistics.entity';
import { UserSkillCategoryStatistics } from '@/entities/user_skill_category_statistics.entity';
import { UserDailyStatistics } from '@/entities/user_daily_statistics.entity';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserAnswer, Question, SkillCategory, UserStatistics, UserSkillCategoryStatistics, UserDailyStatistics])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
