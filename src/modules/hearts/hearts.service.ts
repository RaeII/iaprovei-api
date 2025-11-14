import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import { HeartStatus, MAX_HEARTS, HEART_REGENERATION_INTERVAL_HOURS } from './schemas/hearts.schema';

@Injectable()
export class HeartsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  /**
   * Initialize hearts for a user
   * Sets max_hearts to 5 and current_hearts to 5
   * Should be called when creating a new user
   */
  async initializeHearts(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      max_lives: MAX_HEARTS,
      current_lives: MAX_HEARTS,
      last_heart_regeneration_at: new Date(),
    });
  }

  /**
   * Get current heart status for a user
   * Automatically regenerates hearts if needed before returning status
   */
  async getHeartStatus(userId: number): Promise<HeartStatus> {
    // Regenerate hearts first
    await this.regenerateHearts(userId);

    const user = await this.findUser(userId);

    const isFull = user.current_lives >= user.max_lives;
    const heartsToRegenerate = Math.max(0, user.max_lives - user.current_lives);

    let nextHeartRegenerationAt: Date | null = null;
    if (!isFull && user.last_heart_regeneration_at) {
      nextHeartRegenerationAt = new Date(user.last_heart_regeneration_at.getTime() + HEART_REGENERATION_INTERVAL_HOURS * 60 * 60 * 1000);
    }

    return {
      current_hearts: user.current_lives,
      max_hearts: user.max_lives,
      hearts_to_regenerate: heartsToRegenerate,
      next_heart_regeneration_at: nextHeartRegenerationAt,
      is_full: isFull,
    };
  }

  /**
   * Regenerate hearts based on time elapsed
   * One heart is restored every hour, up to the maximum of 5
   * This method is called automatically before deducting or checking hearts
   */
  async regenerateHearts(userId: number): Promise<void> {
    const user = await this.findUser(userId);

    // If user already has max hearts, no need to regenerate
    if (user.current_lives >= user.max_lives) {
      return;
    }

    // If no last regeneration time, set it to now and return
    if (!user.last_heart_regeneration_at) {
      await this.usersRepository.update(userId, {
        last_heart_regeneration_at: new Date(),
      });
      return;
    }

    const now = new Date();
    const lastRegeneration = new Date(user.last_heart_regeneration_at);
    const hoursSinceLastRegeneration = (now.getTime() - lastRegeneration.getTime()) / (1000 * 60 * 60);

    // Calculate how many hearts should be regenerated
    const heartsToRegenerate = Math.floor(hoursSinceLastRegeneration / HEART_REGENERATION_INTERVAL_HOURS);

    if (heartsToRegenerate > 0) {
      const newHeartCount = Math.min(user.current_lives + heartsToRegenerate, user.max_lives);

      // Calculate the new last_heart_regeneration_at based on the number of hearts regenerated
      const newLastRegeneration = new Date(lastRegeneration.getTime() + heartsToRegenerate * HEART_REGENERATION_INTERVAL_HOURS * 60 * 60 * 1000);

      await this.usersRepository.update(userId, {
        current_lives: newHeartCount,
        last_heart_regeneration_at: newLastRegeneration,
      });
    }
  }

  /**
   * Add hearts to a user (for premium features, purchases, etc.)
   * Ensures hearts don't exceed the maximum
   */
  async addHearts(userId: number, amount: number): Promise<HeartStatus> {
    const user = await this.findUser(userId);

    const newHeartCount = Math.min(user.current_lives + amount, user.max_lives);

    await this.usersRepository.update(userId, {
      current_lives: newHeartCount,
      last_heart_regeneration_at: new Date(),
    });

    return this.getHeartStatus(userId);
  }

  /**
   * Reset hearts to maximum (for testing or admin purposes)
   */
  async resetHearts(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      current_lives: MAX_HEARTS,
      last_heart_regeneration_at: new Date(),
    });
  }

  /**
   * Helper method to find a user by ID
   */
  private async findUser(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new DataNotFoundException(`User with id "${userId}"`, 'Usuário', HeartsService.name);
    }
    return user;
  }
}
