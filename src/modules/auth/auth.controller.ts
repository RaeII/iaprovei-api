import { Controller, Post, Body, UnauthorizedException, UsePipes, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Login,
  LoginSchema,
  loginOpenapi,
  LoginResponse,
  loginResponseOpenapi,
  refreshTokenResponseOpenapi,
  RefreshTokenResponse,
  SignupSchema,
  signupOpenapi,
  Signup,
} from './schemas/login.schema';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtRefreshAuthGuard } from './guard/jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @ApiBody({ schema: loginOpenapi })
  @ApiResponse({ schema: loginResponseOpenapi })
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() loginDto: Login): Promise<LoginResponse> {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('signup')
  @ApiBody({ schema: signupOpenapi })
  @ApiResponse({ schema: loginResponseOpenapi })
  @UsePipes(new ZodValidationPipe(SignupSchema))
  async signup(@Body() signupData: Signup): Promise<LoginResponse> {
    return await this.authService.signup(signupData);
  }

  @Post('refresh')
  @ApiBearerAuth()
  @ApiResponse({ schema: refreshTokenResponseOpenapi })
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(@Req() req: Request): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken((req as any)?.user?.user_id);
  }
}
