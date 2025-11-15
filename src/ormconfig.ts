import { DataSource } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

const config: MysqlConnectionOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Dynamic entity loading using glob patterns
  entities: [
    // For development (TypeScript files)
    __dirname + '/**/*.entity.ts',
    // For production (compiled JavaScript files)
    __dirname + '/**/*.entity.js',
  ],
  synchronize: process.env.NODE_ENV !== 'production',
  // synchronize: false,
  //logging: process.env.NODE_ENV !== 'production',
  logging: false,
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
};

const AppDataSource = new DataSource(config);
export { AppDataSource };
export default () => config;
