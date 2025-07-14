import { Controller, Get, Put, Param, Delete, UsePipes, UseGuards, Body, ParseIntPipe } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { User } from '@/entities/user.entity';
import { UserDetailResponse, userDetailResponseOpenapi, UserListResponse, userListResponseOpenapi, UserUpdate, UserUpdateSchema } from './schemas/user.schema';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';

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
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDetailResponse> {
    return { data: await this.usersService.findOne(+id) };
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
