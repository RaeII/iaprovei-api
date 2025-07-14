import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UniqueDataException } from '@/domain/shared/exceptions/unique-data.exception';
import { User } from '@/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserValidator {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  async assertEmailIsNotAlreadyInUse(email: string): Promise<void> {
    if (!email) return; // Email is optional in the new schema

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UniqueDataException(`Email ${email}`, 'Email', UserValidator.name);
    }
    return;
  }

  async assertUsernameIsNotAlreadyInUse(username: string): Promise<void> {
    const existingUser = await this.usersRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new UniqueDataException(`Username ${username}`, 'Username', UserValidator.name);
    }
    return;
  }
}
