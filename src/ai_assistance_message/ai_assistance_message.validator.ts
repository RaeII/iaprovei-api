import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '@/entities/question.entity';
import { DataNotFoundException } from '@/domain/shared/exceptions/data-not-found.exception';
import { MissingDataException } from '@/domain/shared/exceptions/missing-data.exception';

@Injectable()
export class AiAssistanceMessageValidator {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>
  ) {}

  async assertQuestionExists(questionId: number): Promise<void> {
    if (!questionId) {
      throw new MissingDataException('question_id', 'Question ID is required', AiAssistanceMessageValidator.name);
    }

    const question = await this.questionsRepository.findOne({
      where: { id: questionId, is_active: true },
    });

    if (!question) {
      throw new DataNotFoundException(`Question with ID ${questionId}`, 'Question', AiAssistanceMessageValidator.name);
    }
  }

  async assertMessageIsValid(message: string): Promise<void> {
    if (!message || message.trim().length === 0) {
      throw new MissingDataException('message', 'Message content is required', AiAssistanceMessageValidator.name);
    }

    if (message.length > 65535) {
      throw new MissingDataException('message', 'Message content is too long', AiAssistanceMessageValidator.name);
    }
  }
}
