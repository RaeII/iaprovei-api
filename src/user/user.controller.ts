import { Controller, Get, Put, Param, Delete, UsePipes, UseGuards, Body, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { User } from '@/entities/user.entity';
import { UserDetailResponse, userDetailResponseOpenapi, UserListResponse, userListResponseOpenapi, UserUpdate, UserUpdateSchema } from './schemas/user.schema';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { BasicUserInfo } from '@/common/decorators';
import { CustomForbiddenException } from '@/domain/shared/exceptions/custom-fobidden.exception';

@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiResponse({ schema: userListResponseOpenapi })
  async findAll(): Promise<UserListResponse> {
    return { data: await this.usersService.findAll() };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiResponse({ schema: userDetailResponseOpenapi })
  async findOne(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: User): Promise<UserDetailResponse> {
    if (user.id !== id) {
      throw new CustomForbiddenException('Fetch other users data');
    }
    return { data: await this.usersService.findOne(+id) };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiResponse({ schema: userDetailResponseOpenapi })
  async findMe(@BasicUserInfo() user: User): Promise<UserDetailResponse> {
    return { data: await this.usersService.findOne(user.id) };
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(UserUpdateSchema))
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UserUpdate): Promise<User> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(+id);
  }
}
