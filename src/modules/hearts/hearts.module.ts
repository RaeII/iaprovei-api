import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { HeartsService } from './hearts.service';
import { HeartsController } from './hearts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [HeartsController],
  providers: [HeartsService],
  exports: [HeartsService],
})
export class HeartsModule {}

