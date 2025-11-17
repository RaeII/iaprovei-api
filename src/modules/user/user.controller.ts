import { Controller, Get, Put, Param, Delete, UseGuards, Body, ParseIntPipe, Post } from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import { User } from '@/entities/user.entity';
import {
  UserBasicInfo,
  UserDetailResponse,
  UserListResponse,
  UserMe,
  userDetailResponseOpenapi,
  userListResponseOpenapi,
  UserUpdate,
  UserUpdateSchema,
  userMeOpenapi,
  UserMeResponse,
  userUpdateOpenapi,
  ValidateEmail,
  ValidatePhone,
  ValidateUsername,
  ValidationResponse,
  validateEmailOpenapi,
  validatePhoneOpenapi,
  validateUsernameOpenapi,
  validationResponseOpenapi,
  ValidateEmailSchema,
  ValidatePhoneSchema,
  ValidateUsernameSchema,
} from './schemas/user.schema';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
import { BasicUserInfo } from '@/common/decorators';
import { Role } from '@/modules/auth/enums/role.enum';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserValidator } from './user.validator';

@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private readonly userValidator: UserValidator
  ) {}

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
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @BasicUserInfo() user: UserBasicInfo
  ): Promise<UserDetailResponse> {
    await this.userValidator.assertIsOwner(id, user);
    return { data: await this.usersService.findOne(+id) };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBody({ schema: userUpdateOpenapi })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UserUpdateSchema)) updateUserDto: UserUpdate,
    @BasicUserInfo() user: UserBasicInfo
  ): Promise<UserMe> {
    await this.userValidator.assertIsOwner(id, user);
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: User): Promise<void> {
    await this.userValidator.assertIsOwner(id, user);
    return this.usersService.remove(+id);
  }

  @Post('validate/email')
  @ApiBody({ schema: validateEmailOpenapi })
  @ApiResponse({ schema: validationResponseOpenapi })
  async validateEmail(
    @Body(new ZodValidationPipe(ValidateEmailSchema)) body: ValidateEmail
  ): Promise<ValidationResponse> {
    return this.usersService.validateEmail(body.email);
  }

  @Post('validate/phone')
  @ApiBody({ schema: validatePhoneOpenapi })
  @ApiResponse({ schema: validationResponseOpenapi })
  async validatePhone(
    @Body(new ZodValidationPipe(ValidatePhoneSchema)) body: ValidatePhone
  ): Promise<ValidationResponse> {
    return this.usersService.validatePhone(body.phone);
  }

  @Post('validate/username')
  @ApiBody({ schema: validateUsernameOpenapi })
  @ApiResponse({ schema: validationResponseOpenapi })
  async validateUsername(
    @Body(new ZodValidationPipe(ValidateUsernameSchema)) body: ValidateUsername
  ): Promise<ValidationResponse> {
    return this.usersService.validateUsername(body.username);
  }
}
