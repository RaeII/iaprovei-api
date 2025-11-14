import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import { User } from '@/entities/user.entity';
import { HeartDeductionResponse } from '@/modules/hearts/schemas/hearts.schema';
import { HeartsService } from '@/modules/hearts/hearts.service';

@Injectable()
export class UserHeartsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly heartsService: HeartsService
  ) {}

  /**
   * Deduct one heart from the user
   * Called when a user answers a question incorrectly
   * Returns updated heart count
   */
  async deductHeart(userId: number): Promise<HeartDeductionResponse> {
    // First regenerate any pending hearts
    await this.heartsService.regenerateHearts(userId);

    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user || user.current_lives <= 0) {
      return {
        success: false,
        current_hearts: 0,
        message: 'Você não tem mais corações disponíveis',
      };
    }

    const newHeartCount = user.current_lives - 1;

    await this.usersRepository.update(userId, {
      current_lives: newHeartCount,
    });

    return {
      success: true,
      current_hearts: newHeartCount,
      message:
        newHeartCount === 0
          ? 'Você perdeu seu último coração! Aguarde a regeneração.'
          : `Você perdeu um coração. Restam ${newHeartCount} corações.`,
    };
  }

  /**
   * Ensures the user still has hearts available before starting heart-gated flows.
   * Throws ForbiddenException when no hearts remain to prevent the action.
   */
  async assertHasAvailableHearts(userId: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'current_lives'],
    });

    if (!user) {
      throw new DataNotFoundException(`User with id "${userId}"`, 'Usuário', UserHeartsService.name);
    }

    if ((user.current_lives ?? 0) <= 0) {
      throw new ForbiddenException('Você não tem corações disponíveis para responder questões.');
    }
  }
}
