import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '@/auth/auth.service';
import { AuthController } from '@/auth/auth.controller';
import { UserModule } from '@/user/user.module';
import { JwtModule } from '@/jwt/jwt.module';
import { JwtStrategy } from '@/auth/strategy/jwt.strategy';
import { JwtRefreshStrategy } from '@/auth/strategy/jwt-refresh.strategy';
import jwtConfig from '@/config/jwt.config';
import jwtRefreshConfig from '@/config/jwt-refresh.config';

@Module({
  imports: [UserModule, PassportModule, JwtModule, ConfigModule.forFeature(jwtConfig), ConfigModule.forFeature(jwtRefreshConfig)],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
