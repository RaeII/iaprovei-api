import { Module } from '@nestjs/common';
import { UserContextService } from './services/user-context.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { SharedUserLookupService } from './services/user-lookup.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User])],
  providers: [
    UserContextService,
    {
      provide: 'IUserLookupService',
      useClass: SharedUserLookupService,
    },
  ],
  exports: [UserContextService, 'IUserLookupService'],
})
export class SharedModule {}
