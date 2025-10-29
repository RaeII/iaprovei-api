import { Module } from '@nestjs/common';
import { UserContextService } from './services/user-context.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { SharedUserLookupService } from './services/user-lookup.service';
import { SkillCategoryLookupService } from './services/skill-category-lookup.service';
import { SharedPlanLookupService } from './services/plan-lookup.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { SkillCategory } from '@/entities/skill_category.entity';
import { Plan } from '@/entities/plan.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User, SkillCategory, Plan])],
  providers: [
    UserContextService,
    {
      provide: 'IUserLookupService',
      useClass: SharedUserLookupService,
    },
    {
      provide: 'ISkillCategoryLookupService',
      useClass: SkillCategoryLookupService,
    },
    {
      provide: 'IPlanLookupService',
      useClass: SharedPlanLookupService,
    },
  ],
  exports: [UserContextService, 'IUserLookupService', 'ISkillCategoryLookupService', 'IPlanLookupService'],
})
export class SharedModule {}
