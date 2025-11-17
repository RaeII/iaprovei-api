import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthController } from '@/modules/auth/auth.controller';
import { UserModule } from '@/modules/user/user.module';
import { JwtModule } from '@/modules/jwt/jwt.module';
import { JwtStrategy } from '@/modules/auth/strategy/jwt.strategy';
import { JwtRefreshStrategy } from '@/modules/auth/strategy/jwt-refresh.strategy';
import jwtConfig from '@/config/jwt.config';
import jwtRefreshConfig from '@/config/jwt-refresh.config';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule,
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(jwtRefreshConfig),
  ],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
