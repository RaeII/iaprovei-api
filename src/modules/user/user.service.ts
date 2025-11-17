import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User as UserEntity } from '@/entities/user.entity';
import { UserValidator } from '@/modules/user/user.validator';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import {
  UserCreate,
  UserListData,
  UserMe,
  UserUpdate,
  User,
  UserMeSchema,
  UserListDataSchema,
  ValidationResponse,
} from './schemas/user.schema';
import { HeartsService } from '@/modules/hearts/hearts.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private userValidator: UserValidator,
    private heartsService: HeartsService
  ) {}

  // Helper method to get UserMe select fields automatically from schema
  private getUserMeSelectFields(): (keyof UserEntity)[] {
    // Get the keys from UserMeSchema shape
    const userMeKeys = Object.keys(UserMeSchema.shape) as (keyof UserEntity)[];
    return userMeKeys;
  }

  async create(createUserDto: UserCreate): Promise<UserMe> {
    await this.userValidator.assertEmailIsNotAlreadyInUse(createUserDto.email);
    await this.userValidator.assertUsernameIsNotAlreadyInUse(createUserDto.username);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Remove password and prepare user data for creation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userDataWithoutPassword } = createUserDto;

    const newUser = this.usersRepository.create({
      ...userDataWithoutPassword,
      password_hash: hashedPassword,
      total_xp: 0,
      current_lives: 0,
      max_lives: 0,
      current_streak: 0,
      best_streak: 0,
      is_active: true,
      email_verified: false,
    } as Partial<UserEntity>);

    const savedUser = await this.usersRepository.save(newUser);

    // Initialize hearts for the new user (5 hearts)
    await this.heartsService.initializeHearts(savedUser.id);

    // Fetch the saved user with only UserMe fields
    return this.findMe(savedUser.id);
  }

  async findAll(): Promise<UserListData[]> {
    return this.usersRepository.find({ select: Object.keys(UserListDataSchema.shape) as (keyof UserEntity)[] });
  }

  async findOne(id: number): Promise<UserListData> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: Object.keys(UserListDataSchema.shape) as (keyof UserEntity)[],
    });
    if (!user) {
      throw new DataNotFoundException(`User with id "${id}"`, 'Usuário', UserService.name);
    }
    return user;
  }

  async findOneEager(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new DataNotFoundException(`User with id "${id}"`, 'Usuário', UserService.name);
    }
    return user;
  }

  async findMe(id: number): Promise<UserMe> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: this.getUserMeSelectFields(),
    });
    if (!user) {
      throw new DataNotFoundException(`User with id "${id}"`, 'Usuário', UserService.name);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UserUpdate): Promise<UserMe> {
    const user = await this.findOneEager(id);

    // Handle password update if provided
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...updateData } = updateUserDto;
      Object.assign(user, { ...updateData, password_hash: hashedPassword });
    } else {
      Object.assign(user, updateUserDto);
    }

    await this.usersRepository.save(user as UserEntity);

    // Return the updated user with only UserMe fields
    return this.findMe(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new DataNotFoundException(`User with id "${id}"`, 'Usuário', UserService.name);
    }
  }

  async validateEmail(email: string): Promise<ValidationResponse> {
    try {
      await this.userValidator.assertEmailIsNotAlreadyInUse(email);
      return {
        is_available: true,
        message: 'Email disponível',
      };
    } catch (error) {
      return {
        is_available: false,
        message: 'Email já está em uso',
      };
    }
  }

  async validatePhone(phone: string): Promise<ValidationResponse> {
    try {
      await this.userValidator.assertPhoneIsNotAlreadyInUse(phone);
      return {
        is_available: true,
        message: 'Phone está disponível',
      };
    } catch (error) {
      return {
        is_available: false,
        message: 'Phone já está em uso',
      };
    }
  }

  async validateUsername(username: string): Promise<ValidationResponse> {
    try {
      await this.userValidator.assertUsernameIsNotAlreadyInUse(username);
      return {
        is_available: true,
        message: 'Username está disponível',
      };
    } catch (error) {
      return {
        is_available: false,
        message: 'Username já está em uso',
      };
    }
  }
}
