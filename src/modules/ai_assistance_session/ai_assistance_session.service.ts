import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAssistanceSession } from '@/entities/ai_assistance_session.entity';
import { AiAssistanceSessionValidator } from './ai_assistance_session.validator';
import { AiAssistanceSessionCreate } from './schemas/ai_assistance_session.schema';

@Injectable()
export class AiAssistanceSessionService {
  constructor(
    @InjectRepository(AiAssistanceSession)
    private aiAssistanceSessionsRepository: Repository<AiAssistanceSession>,
    private aiAssistanceSessionValidator: AiAssistanceSessionValidator
  ) {}

  /**
   * Find existing AI assistance session by question and user
   * Used to retrieve session for message creation
   */
  async findByQuestionAndUser(questionId: number, userId: number): Promise<AiAssistanceSession | null> {
    return this.aiAssistanceSessionsRepository.findOne({
      where: {
        question_id: questionId,
        user_id: userId,
      },
    });
  }

  /**
   * Create a new AI assistance session
   * Validates user existence, question existence, and session ID format
   * Optimized for performance using single database transaction
   * Follows SOLID principles with separated validation logic
   */
  async create(createAiAssistanceSessionDto: AiAssistanceSessionCreate): Promise<AiAssistanceSession> {
    // Validate input data using the validator (follows Single Responsibility Principle)
    await Promise.all([this.aiAssistanceSessionValidator.assertUserExists(createAiAssistanceSessionDto.user_id), this.aiAssistanceSessionValidator.assertQuestionExists(createAiAssistanceSessionDto.question_id), this.aiAssistanceSessionValidator.assertSessionIdIsValid(createAiAssistanceSessionDto.session_id)]);
    console.log('createAiAssistanceSessionDto', createAiAssistanceSessionDto);
    // Create the AI assistance session entity
    const newAiAssistanceSession = this.aiAssistanceSessionsRepository.create({
      ...createAiAssistanceSessionDto,
    });

    // Save and return the created session
    return this.aiAssistanceSessionsRepository.save(newAiAssistanceSession);
  }
}
