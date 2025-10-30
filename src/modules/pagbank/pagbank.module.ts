import { Module } from '@nestjs/common';
import { PagbankController } from './pagbank.controller';
import { PagbankService } from './pagbank.service';
import { SharedModule } from '@/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [PagbankController],
  providers: [PagbankService],
  exports: [PagbankService],
})
export class PagbankModule {}
