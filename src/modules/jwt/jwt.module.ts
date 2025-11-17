import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModule as JwtModuleNest } from '@nestjs/jwt';
import jwtConfig from '@/config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import jwtRefreshConfig from '@/config/jwt-refresh.config';

@Module({
  imports: [
    JwtModuleNest.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(jwtRefreshConfig),
  ],
  providers: [JwtService],
  exports: [JwtService, JwtModuleNest],
})
export class JwtModule {}
