import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { UserContextService } from './services/user-context.service';

@Module({
  imports: [AuthModule],
  providers: [UserContextService],
  exports: [UserContextService],
})
export class CommonModule {}
