import { Controller, Get, Put, Param, Delete, UsePipes, UseGuards, Body, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { User } from '@/entities/user.entity';
import { UserBasicInfo, UserDetailResponse, UserListResponse, UserMe, userDetailResponseOpenapi, userListResponseOpenapi, UserUpdate, UserUpdateSchema, userMeOpenapi, UserMeResponse } from './schemas/user.schema';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { BasicUserInfo } from '@/common/decorators';
import { CustomForbiddenException } from '@/domain/shared/exceptions/custom-fobidden.exception';
import { Role } from '@/auth/enums/role.enum';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserValidator } from './user.validator';

@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly usersService: UserService, private readonly userValidator: UserValidator) {}

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiResponse({ schema: userListResponseOpenapi })
  async findAll(): Promise<UserListResponse> {
    return { data: await this.usersService.findAll() };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiResponse({ schema: userMeOpenapi })
  async findMe(@BasicUserInfo() user: UserBasicInfo): Promise<UserMeResponse> {
    return { data: await this.usersService.findMe(user.id) };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiResponse({ schema: userDetailResponseOpenapi })
  async findOne(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: UserBasicInfo): Promise<UserDetailResponse> {
    await this.userValidator.assertIsOwner(id, user);
    return { data: await this.usersService.findOne(+id) };
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(UserUpdateSchema))
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UserUpdate, @BasicUserInfo() user: UserBasicInfo): Promise<UserMe> {
    await this.userValidator.assertIsOwner(id, user);
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: User): Promise<void> {
    await this.userValidator.assertIsOwner(id, user);
    return this.usersService.remove(+id);
  }
}
