import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAssistanceSession } from '@/entities/ai_assistance_session.entity';
import { User } from '@/entities/user.entity';
import { Question } from '@/entities/question.entity';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import { MissingDataException } from '@/common/exceptions/missing-data.exception';

@Injectable()
export class AiAssistanceSessionValidator {
  constructor(
    @InjectRepository(AiAssistanceSession)
    private aiAssistanceSessionsRepository: Repository<AiAssistanceSession>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>
  ) {}

  async assertUserExists(userId: number): Promise<void> {
    if (!userId) {
      throw new MissingDataException('user_id', 'User ID is required', AiAssistanceSessionValidator.name);
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new DataNotFoundException(`User with ID ${userId}`, 'User', AiAssistanceSessionValidator.name);
    }
  }

  async assertQuestionExists(questionId: number): Promise<void> {
    if (!questionId) {
      throw new MissingDataException('question_id', 'Question ID is required', AiAssistanceSessionValidator.name);
    }

    const question = await this.questionsRepository.findOne({
      where: { id: questionId, is_active: true },
    });

    if (!question) {
      throw new DataNotFoundException(`Question with ID ${questionId}`, 'Question', AiAssistanceSessionValidator.name);
    }
  }

  async assertSessionIdIsValid(sessionId: string): Promise<void> {
    if (!sessionId || sessionId.trim().length === 0) {
      throw new MissingDataException('session_id', 'Session ID is required', AiAssistanceSessionValidator.name);
    }

    if (sessionId.length > 36) {
      throw new MissingDataException('session_id', 'Session ID must not exceed 36 characters', AiAssistanceSessionValidator.name);
    }
  }
}
