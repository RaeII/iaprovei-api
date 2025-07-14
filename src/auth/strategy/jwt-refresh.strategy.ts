import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import jwtRefreshConfig from '@/config/jwt-refresh.config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(@Inject(jwtRefreshConfig.KEY) private jwtRefreshConfiguration: ConfigType<typeof jwtRefreshConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtRefreshConfiguration.secret,
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      return null;
    }
    return { user_id: payload.sub, username: payload.username };
  }
}
