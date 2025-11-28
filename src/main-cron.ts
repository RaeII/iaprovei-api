import { NestFactory } from '@nestjs/core';
import { CronRunnerModule } from './cron/cron-runner.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CronRunnerModule, {
    logger: false,
  });
  
  // Keep the process alive
  // NestJS ApplicationContext usually keeps the process alive if there are active handles (like DB connection or Cron jobs).
  // However, sometimes we need to ensure it doesn't exit immediately.
  // @nestjs/schedule jobs should keep the event loop active.
}
bootstrap();
