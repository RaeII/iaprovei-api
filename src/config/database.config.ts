import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import ormconfig from '@/ormconfig';

export default registerAs('DATABASE_CON', (): TypeOrmModuleOptions => {
  const config = ormconfig();

  return {
    ...config,
    // NestJS Auto-Discovery: Automatically finds entities from forFeature()
    autoLoadEntities: true,
  };
});
