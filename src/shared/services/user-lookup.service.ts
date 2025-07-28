import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { IUserLookupService } from '@/shared/contracts/user-lookup.contract';

@Injectable()
export class SharedUserLookupService implements IUserLookupService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findActiveUserById(userId: number): Promise<{ is_active: boolean } | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { is_active: true },
    });

    return user;
  }

  async findUserByEmail(email: string): Promise<{ id: number; password_hash: string; is_active: boolean } | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, password_hash: true, is_active: true },
    });

    return user;
  }
}
