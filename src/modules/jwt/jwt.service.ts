import { Inject, Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { JwtService as JwtServiceNest } from '@nestjs/jwt';
import jwtRefreshConfig from '@/config/jwt-refresh.config';

@Injectable()
export class JwtService {
  constructor(
    private configService: ConfigService,
    private jwtServiceNest: JwtServiceNest,
    @Inject(jwtRefreshConfig.KEY) private jwtRefreshConfiguration: ConfigType<typeof jwtRefreshConfig>
  ) {}

  async generateAuthTokenWithRefreshToken(payload: any) {
    const token = this.jwtServiceNest.sign(payload);
    const refreshToken = this.jwtServiceNest.sign(payload, this.jwtRefreshConfiguration);

    return { id: payload.sub, access_token: token, refresh_token: refreshToken };
  }

  async generateAuthToken(payload: any) {
    const token = this.jwtServiceNest.sign(payload);

    return { id: payload.sub, access_token: token };
  }
}
