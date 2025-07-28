import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UniqueDataException } from '@/common/exceptions/unique-data.exception';
import { User } from '@/entities/user.entity';
import { Repository } from 'typeorm';
import { CustomForbiddenException } from '@/common/exceptions/custom-fobidden.exception';
import { UserBasicInfo } from './schemas/user.schema';

@Injectable()
export class UserValidator {
  constructor(@InjectRepository(User) private repository: Repository<User>) {}

  async assertEmailIsNotAlreadyInUse(email: string): Promise<void> {
    if (!email) return; // Email is optional in the new schema

    const existingUser = await this.repository.findOne({ where: { email } });
    if (existingUser) {
      throw new UniqueDataException(`Email ${email}`, 'Email', UserValidator.name);
    }
    return;
  }

  async assertUsernameIsNotAlreadyInUse(username: string): Promise<void> {
    const existingUser = await this.repository.findOne({ where: { username } });
    if (existingUser) {
      throw new UniqueDataException(`Username ${username}`, 'Username', UserValidator.name);
    }
    return;
  }

  async assertIsOwner(id: number, user: UserBasicInfo): Promise<void> {
    const userData = await this.repository.findOne({ select: { id: true }, where: { id } });

    if (user.id !== userData?.id) {
      throw new CustomForbiddenException('Manage other users data');
    }
    return;
  }
}
