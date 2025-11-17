import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from '@/modules/user/user.service';
import { JwtService } from '@/modules/jwt/jwt.service';
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
    const payload = { username: user.username, sub: user.id, is_admin: user.is_admin };
    const userData = await this.usersService.findMe(user.id);

    const loginData = await this.jwtService.generateAuthTokenWithRefreshToken(payload);
    return {
      ...loginData,
      user: userData,
    };
  }

  async refreshToken(userId: number) {
    const user = await this.usersService.findOne(userId);
    const payload = { username: user.username, sub: userId, is_admin: user.is_admin };
    return this.jwtService.generateAuthToken(payload);
  }

  async signup(signupData: Signup) {
    const user = await this.usersService.create(signupData);
    const loginData = await this.login(user);
    return {
      ...loginData,
      user: user,
    };
  }

  /**
   * Check if a user has admin privileges
   */
  async isUserAdmin(userId: number): Promise<boolean> {
    const user = await this.usersService.findOneEager(userId);
    return user.is_admin;
  }
}
