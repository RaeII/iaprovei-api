import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAnswer } from '@/entities/user_answer.entity';
import { QuestionOption } from '@/entities/question_option.entity';

@Injectable()
export class AnsweredQuestionGuard implements CanActivate {
  constructor(
    @InjectRepository(UserAnswer)
    private userAnswersRepository: Repository<UserAnswer>,
    @InjectRepository(QuestionOption)
    private questionOptionsRepository: Repository<QuestionOption>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // From JWT guard
    let questionId = this.extractQuestionId(request);

    if (!user?.user_id) {
      throw new ForbiddenException('User not authenticated');
    }

    // If we have an option ID but no question ID, lookup the question ID
    if (!questionId && request.params?.id) {
      const option = await this.questionOptionsRepository.findOne({
        where: { id: parseInt(request.params.id, 10) },
        select: ['question_id'],
      });

      if (!option) {
        throw new ForbiddenException('Question option not found');
      }

      questionId = option.question_id;
    }

    if (!questionId) {
      throw new ForbiddenException('Question ID is required');
    }

    // Check if user has already answered this question
    const userAnswer = await this.userAnswersRepository.findOne({
      where: {
        users_id: user.user_id,
        question_id: questionId,
      },
    });

    if (!userAnswer) {
      throw new ForbiddenException('You must answer this question before viewing detailed options');
    }

    return true;
  }

  private extractQuestionId(request: any): number | null {
    // From URL params like /question-options/question/:questionId/detailed
    if (request.params?.questionId) {
      return parseInt(request.params.questionId, 10);
    }

    // From query params like /question-options/detailed?question_id=123
    if (request.query?.question_id) {
      return parseInt(request.query.question_id, 10);
    }

    return null;
  }
}
