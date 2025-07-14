import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@/entities/user.entity';
import { UserValidator } from '@/user/user.validator';
import { DataNotFoundException } from '@/domain/shared/exceptions/data-not-found.exception';
import { UserCreate, UserUpdate } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private userValidator: UserValidator
  ) {}

  async create(createUserDto: UserCreate): Promise<User> {
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
    } as Partial<User>);

    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new DataNotFoundException(`User with id "${id}"`, 'Usuário', UserService.name);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UserUpdate): Promise<User> {
    const user = await this.findOne(id);

    // Handle password update if provided
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...updateData } = updateUserDto;
      Object.assign(user, { ...updateData, password_hash: hashedPassword });
    } else {
      Object.assign(user, updateUserDto);
    }

    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new DataNotFoundException(`User with id "${id}"`, 'Usuário', UserService.name);
    }
  }
}
