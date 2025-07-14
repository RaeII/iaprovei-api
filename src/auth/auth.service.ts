import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '@/user/user.service';
import { JwtService } from '@/jwt/jwt.service';
import { Signup } from './schemas/login.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash: _password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    // return {
    //   access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
    //   refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    // };
    return this.jwtService.generateAuthTokenWithRefreshToken(payload);
  }

  async refreshToken(userId: number) {
    const user = await this.usersService.findOne(userId);
    const payload = { username: user.username, sub: userId };
    return this.jwtService.generateAuthToken(payload);
  }

  async signup(signupData: Signup) {
    const user = await this.usersService.create(signupData);
    return this.login(user);
  }
}
