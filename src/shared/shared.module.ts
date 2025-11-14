import { Module } from '@nestjs/common';
import { UserContextService } from './services/user-context.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { SharedUserLookupService } from './services/user-lookup.service';
import { SkillCategoryLookupService } from './services/skill-category-lookup.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { SkillCategory } from '@/entities/skill_category.entity';
import { UserHeartsService } from './services/user-hearts.service';
import { HeartsService } from '@/modules/hearts/hearts.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User, SkillCategory])],
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
    UserHeartsService,
    HeartsService,
  ],
  exports: [UserContextService, 'IUserLookupService', 'ISkillCategoryLookupService', UserHeartsService],
})
export class SharedModule {}
