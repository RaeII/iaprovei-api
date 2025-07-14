import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import ormconfig from '@/ormconfig';

export default registerAs('DATABASE_CON', (): TypeOrmModuleOptions => {
  const config = ormconfig();

  console.log('DB_HOST:', config.host);
  console.log('DB_PORT:', config.port);
  console.log('DB_USERNAME:', config.username);
  console.log('DB_NAME:', config.database);

  return {
    ...config,
    // NestJS Auto-Discovery: Automatically finds entities from forFeature()
    autoLoadEntities: true,
  };
});
