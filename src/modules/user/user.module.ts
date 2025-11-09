import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { UserController } from '@/modules/user/user.controller';
import { UserValidator } from '@/modules/user/user.validator';
import { HeartsModule } from '@/modules/hearts/hearts.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HeartsModule],
  controllers: [UserController],
  providers: [UserService, UserValidator],
  exports: [UserService],
})
export class UserModule {}
