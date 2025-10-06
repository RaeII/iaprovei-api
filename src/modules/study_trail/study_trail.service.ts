import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyTrail, StudyTrailStatus } from '@/entities/study_trail.entity';
import { StudyTrailStop, StudyTrailStopStatus, StudyTrailStopType } from '@/entities/study_trail_stop.entity';
import { StudyTrailStopQuestion, QuestionAnswerStatus } from '@/entities/study_trail_stop_question.entity';
import { StudyTrailPerformance } from '@/entities/study_trail_performance.entity';
import { Question, DifficultyLevel } from '@/entities/question.entity';
import { Subject } from '@/entities/subject.entity';
import { SkillCategory } from '@/entities/skill_category.entity';
import { StudyTrailCreate, StudyTrailStopStart, StudyTrailStopAnswer, StudyTrailSummary, StudyTrailDetails } from './schemas/study_trail.schema';

import { DifficultySelectionStrategy, AdaptiveDifficultyStrategy, DifficultyStrategyFactory } from './strategies/difficulty-selection.strategies';

@Injectable()
export class StudyTrailService {
  constructor(
    @InjectRepository(StudyTrail)
    private studyTrailRepository: Repository<StudyTrail>,
    @InjectRepository(StudyTrailStop)
    private studyTrailStopRepository: Repository<StudyTrailStop>,
    @InjectRepository(StudyTrailStopQuestion)
    private studyTrailStopQuestionRepository: Repository<StudyTrailStopQuestion>,
    @InjectRepository(StudyTrailPerformance)
    private studyTrailPerformanceRepository: Repository<StudyTrailPerformance>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(SkillCategory)
    private skillCategoryRepository: Repository<SkillCategory>
  ) {
    this.difficultyStrategy = new AdaptiveDifficultyStrategy();
  }

  private difficultyStrategy: DifficultySelectionStrategy;

  async createStudyTrail(userId: number, createData: StudyTrailCreate): Promise<StudyTrailSummary> {
    // Verificar se a skill_category existe
    const skillCategory = await this.skillCategoryRepository.findOne({
      where: { id: createData.skill_category_id },
    });

    if (!skillCategory) {
      throw new NotFoundException('Categoria de habilidade não encontrada');
    }

    // Verificar se já existe uma trilha ativa para esta skill_category
    const existingTrail = await this.studyTrailRepository.findOne({
      where: {
        user_id: userId,
        skill_category_id: createData.skill_category_id,
        status: StudyTrailStatus.ACTIVE,
        is_active: true,
      },
    });

    if (existingTrail) {
      throw new BadRequestException('Já existe uma trilha ativa para esta categoria de habilidade');
    }

    // Criar a trilha
    const studyTrail = this.studyTrailRepository.create({
      user_id: userId,
      skill_category_id: createData.skill_category_id,
      name: createData.name || `Trilha de ${skillCategory.name || 'Estudos'}`,
      description: createData.description,
      status: StudyTrailStatus.ACTIVE,
      current_stop_position: 1,
      total_stops: 5,
    });

    const savedTrail = await this.studyTrailRepository.save(studyTrail);

    // Criar a primeira parada (desbloqueada)
    await this.createFirstStop(savedTrail.id, userId, createData.skill_category_id);

    return this.getStudyTrailSummary(savedTrail.id, userId);
  }

  async getUserStudyTrails(userId: number): Promise<StudyTrailSummary[]> {
    const trails = await this.studyTrailRepository.find({
      where: { user_id: userId, is_active: true },
      relations: ['skill_category'],
      order: { created_at: 'DESC' },
    });

    return trails.map(trail => ({
      id: trail.id,
      skill_category_id: trail.skill_category_id,
      skill_category_name: trail.skill_category?.name || 'Categoria',
      name: trail.name,
      status: trail.status,
      current_stop_position: trail.current_stop_position,
      total_stops: trail.total_stops,
      completion_percentage: trail.completion_percentage,
      total_xp_earned: trail.total_xp_earned,
      average_performance: trail.average_performance,
      created_at: trail.created_at,
      updated_at: trail.updated_at,
    }));
  }

  async getStudyTrailDetails(trailId: number, userId: number): Promise<StudyTrailDetails> {
    const trail = await this.studyTrailRepository.findOne({
      where: { id: trailId, user_id: userId, is_active: true },
      relations: ['skill_category', 'stops'],
    });

    if (!trail) {
      throw new NotFoundException('Trilha de estudos não encontrada');
    }

    const stops = await this.studyTrailStopRepository.find({
      where: { study_trail_id: trailId, is_active: true },
      order: { position_order: 'ASC' },
    });

    return {
      id: trail.id,
      skill_category_id: trail.skill_category_id,
      skill_category_name: trail.skill_category?.name || 'Categoria',
      name: trail.name,
      description: trail.description,
      status: trail.status,
      current_stop_position: trail.current_stop_position,
      total_stops: trail.total_stops,
      completion_percentage: trail.completion_percentage,
      total_xp_earned: trail.total_xp_earned,
      average_performance: trail.average_performance,
      created_at: trail.created_at,
      updated_at: trail.updated_at,
      stops: stops.map(stop => ({
        id: stop.id,
        position_order: stop.position_order,
        name: stop.name,
        description: stop.description,
        stop_type: stop.stop_type,
        difficulty_level: stop.difficulty_level,
        status: stop.status,
        total_questions: stop.total_questions,
        questions_answered: stop.questions_answered,
        correct_answers: stop.correct_answers,
        success_rate: stop.success_rate,
        xp_reward: stop.xp_reward,
        xp_earned: stop.xp_earned,
        estimated_duration_minutes: stop.estimated_duration_minutes,
        minimum_success_rate: stop.minimum_success_rate,
      })),
    };
  }

  async startStudyTrailStop(userId: number, startData: StudyTrailStopStart): Promise<any> {
    // Verificar se a trilha pertence ao usuário
    const trail = await this.studyTrailRepository.findOne({
      where: { id: startData.study_trail_id, user_id: userId, is_active: true },
    });

    if (!trail) {
      throw new NotFoundException('Trilha de estudos não encontrada');
    }

    // Verificar se a parada existe e está disponível
    const stop = await this.studyTrailStopRepository.findOne({
      where: {
        study_trail_id: startData.study_trail_id,
        position_order: startData.stop_position,
        is_active: true,
      },
    });

    if (!stop) {
      // Se a parada não existe, criar dinamicamente
      const newStop = await this.createStudyTrailStop(startData.study_trail_id, startData.stop_position, userId, trail.skill_category_id);
      return this.startStop(newStop);
    }

    if (stop.status === StudyTrailStopStatus.LOCKED) {
      throw new ForbiddenException('Esta parada ainda está bloqueada');
    }

    return this.startStop(stop);
  }

  async answerQuestion(userId: number, answerData: StudyTrailStopAnswer): Promise<any> {
    // Verificar se a questão da parada existe e pertence ao usuário
    const stopQuestion = await this.studyTrailStopQuestionRepository.findOne({
      where: {
        study_trail_stop_id: answerData.study_trail_stop_id,
        question_id: answerData.question_id,
      },
      relations: ['study_trail_stop', 'study_trail_stop.study_trail', 'question', 'question.question_options'],
    });

    if (!stopQuestion || stopQuestion.study_trail_stop.study_trail.user_id !== userId) {
      throw new NotFoundException('Questão não encontrada ou não pertence ao usuário');
    }

    if (stopQuestion.answer_status !== QuestionAnswerStatus.NOT_ANSWERED) {
      throw new BadRequestException('Esta questão já foi respondida');
    }

    // Verificar se a resposta está correta
    const correctOption = stopQuestion.question.question_options?.find(opt => opt.is_correct);
    const isCorrect = correctOption && correctOption.id === answerData.selected_option_id;

    // Atualizar a resposta
    stopQuestion.selected_option_id = answerData.selected_option_id;
    stopQuestion.answer_status = isCorrect ? QuestionAnswerStatus.CORRECT : QuestionAnswerStatus.INCORRECT;
    stopQuestion.response_time_seconds = answerData.response_time_seconds || 0;
    stopQuestion.used_hint = answerData.used_hint || false;
    stopQuestion.confidence_level = answerData.confidence_level;
    stopQuestion.answered_at = new Date();

    // Calcular XP ganho
    const baseXP = 10;
    let xpMultiplier = 1;

    if (isCorrect) {
      xpMultiplier = 1.5;
      if (answerData.response_time_seconds && answerData.response_time_seconds < 30) {
        xpMultiplier += 0.5; // Bônus por resposta rápida
      }
      if (!answerData.used_hint) {
        xpMultiplier += 0.3; // Bônus por não usar dica
      }
    }

    stopQuestion.xp_earned = Math.round(baseXP * xpMultiplier);

    await this.studyTrailStopQuestionRepository.save(stopQuestion);

    // Atualizar estatísticas da parada
    await this.updateStopStatistics(stopQuestion.study_trail_stop_id);

    // Atualizar performance do usuário
    await this.updateUserPerformance(userId, stopQuestion.study_trail_stop.study_trail.skill_category_id, isCorrect, answerData.response_time_seconds || 0);

    return {
      is_correct: isCorrect,
      xp_earned: stopQuestion.xp_earned,
      correct_option_id: correctOption?.id,
      explanation: stopQuestion.question.explanation,
    };
  }

  private async createFirstStop(trailId: number, userId: number, skillCategoryId: number): Promise<StudyTrailStop> {
    return this.createStudyTrailStop(trailId, 1, userId, skillCategoryId);
  }

  private async createStudyTrailStop(trailId: number, position: number, userId: number, skillCategoryId: number): Promise<StudyTrailStop> {
    // Obter performance do usuário para determinar dificuldade
    const performance = await this.getUserPerformance(userId, skillCategoryId);

    // Obter performance da última parada se existir
    let lastStopPerformance: number | undefined;
    if (position > 1) {
      const lastStop = await this.studyTrailStopRepository.findOne({
        where: { study_trail_id: trailId, position_order: position - 1 },
      });
      lastStopPerformance = lastStop?.success_rate;
    }

    const difficulty = this.difficultyStrategy.selectDifficulty(performance, lastStopPerformance);

    // Criar a parada
    const stop = this.studyTrailStopRepository.create({
      study_trail_id: trailId,
      position_order: position,
      name: `Parada ${position}`,
      description: `Parada ${position} da trilha de estudos`,
      stop_type: StudyTrailStopType.PRACTICE,
      difficulty_level: difficulty,
      status: position === 1 ? StudyTrailStopStatus.AVAILABLE : StudyTrailStopStatus.LOCKED,
      total_questions: 10,
      xp_reward: this.calculateXPReward(difficulty),
      estimated_duration_minutes: 15,
      minimum_success_rate: 70,
    });

    const savedStop = await this.studyTrailStopRepository.save(stop);

    // Gerar questões para a parada
    await this.generateQuestionsForStop(savedStop.id, skillCategoryId, difficulty, 10);

    return savedStop;
  }

  private async generateQuestionsForStop(stopId: number, skillCategoryId: number, difficulty: DifficultyLevel, totalQuestions: number): Promise<void> {
    // Buscar questões da skill_category com a dificuldade especificada
    // Fazendo JOIN com subjects para filtrar por skill_category_id
    const questions = await this.questionRepository
      .createQueryBuilder('question')
      .innerJoin('question.origin_subject', 'subject')
      .where('subject.skill_category_id = :skillCategoryId', { skillCategoryId })
      .andWhere('question.difficulty_level = :difficulty', { difficulty })
      .andWhere('question.is_active = :isActive', { isActive: true })
      .orderBy('question.id', 'DESC')
      .take(totalQuestions * 2) // Pegar mais questões para ter variedade
      .getMany();

    if (questions.length === 0) {
      throw new BadRequestException(`Não há questões disponíveis para a dificuldade ${difficulty} nesta categoria de habilidade`);
    }

    // Selecionar questões aleatoriamente
    const selectedQuestions = this.shuffleArray(questions).slice(0, Math.min(totalQuestions, questions.length));

    // Criar registros de questões da parada
    const stopQuestions = selectedQuestions.map((question, index) =>
      this.studyTrailStopQuestionRepository.create({
        study_trail_stop_id: stopId,
        question_id: question.id,
        question_order: index + 1,
        answer_status: QuestionAnswerStatus.NOT_ANSWERED,
      })
    );

    await this.studyTrailStopQuestionRepository.save(stopQuestions);
  }

  private async startStop(stop: StudyTrailStop): Promise<any> {
    // Marcar parada como em progresso
    stop.status = StudyTrailStopStatus.IN_PROGRESS;
    stop.started_at = new Date();
    await this.studyTrailStopRepository.save(stop);

    // Buscar questões da parada
    const questions = await this.studyTrailStopQuestionRepository.find({
      where: { study_trail_stop_id: stop.id },
      relations: ['question', 'question.question_options'],
      order: { question_order: 'ASC' },
    });

    return {
      stop_id: stop.id,
      stop_name: stop.name,
      difficulty_level: stop.difficulty_level,
      total_questions: stop.total_questions,
      xp_reward: stop.xp_reward,
      questions: questions.map(sq => ({
        id: sq.id,
        question_id: sq.question.id,
        question_order: sq.question_order,
        affirmation: sq.question.affirmation,
        image_url: sq.question.image_url,
        question_type: sq.question.question_type,
        learning_tip: sq.question.learning_tip,
        options:
          sq.question.question_options?.map(opt => ({
            id: opt.id,
            option_text: opt.option_text,
          })) || [],
      })),
    };
  }

  private async updateStopStatistics(stopId: number): Promise<void> {
    const questions = await this.studyTrailStopQuestionRepository.find({
      where: { study_trail_stop_id: stopId },
    });

    const answeredQuestions = questions.filter(q => q.answer_status !== QuestionAnswerStatus.NOT_ANSWERED);
    const correctAnswers = questions.filter(q => q.answer_status === QuestionAnswerStatus.CORRECT);

    const stop = await this.studyTrailStopRepository.findOne({
      where: { id: stopId },
      relations: ['study_trail'],
    });

    if (!stop) return;

    stop.questions_answered = answeredQuestions.length;
    stop.correct_answers = correctAnswers.length;
    stop.success_rate = answeredQuestions.length > 0 ? (correctAnswers.length / answeredQuestions.length) * 100 : 0;
    stop.xp_earned = questions.reduce((sum, q) => sum + q.xp_earned, 0);

    // Se todas as questões foram respondidas, marcar como completa
    if (answeredQuestions.length === stop.total_questions) {
      stop.status = StudyTrailStopStatus.COMPLETED;
      stop.completed_at = new Date();

      // Desbloquear próxima parada se performance for suficiente
      if (stop.success_rate >= stop.minimum_success_rate && stop.position_order < stop.study_trail.total_stops) {
        await this.unlockNextStop(stop.study_trail_id, stop.position_order + 1, stop.study_trail.user_id, stop.study_trail.skill_category_id);
      }

      // Atualizar trilha se for a última parada
      if (stop.position_order === stop.study_trail.total_stops) {
        await this.completeStudyTrail(stop.study_trail_id);
      }
    }

    await this.studyTrailStopRepository.save(stop);
  }

  private async unlockNextStop(trailId: number, nextPosition: number, userId: number, skillCategoryId: number): Promise<void> {
    let nextStop = await this.studyTrailStopRepository.findOne({
      where: { study_trail_id: trailId, position_order: nextPosition },
    });

    if (!nextStop) {
      // Criar próxima parada dinamicamente
      nextStop = await this.createStudyTrailStop(trailId, nextPosition, userId, skillCategoryId);
    } else {
      nextStop.status = StudyTrailStopStatus.AVAILABLE;
      await this.studyTrailStopRepository.save(nextStop);
    }

    // Atualizar posição atual da trilha
    await this.studyTrailRepository.update(trailId, {
      current_stop_position: nextPosition,
    });
  }

  private async completeStudyTrail(trailId: number): Promise<void> {
    await this.studyTrailRepository.update(trailId, {
      status: StudyTrailStatus.COMPLETED,
      completion_percentage: 100,
      completed_at: new Date(),
    });
  }

  private async getUserPerformance(userId: number, skillCategoryId: number): Promise<StudyTrailPerformance> {
    let performance = await this.studyTrailPerformanceRepository.findOne({
      where: { user_id: userId, skill_category_id: skillCategoryId },
    });

    if (!performance) {
      performance = this.studyTrailPerformanceRepository.create({
        user_id: userId,
        skill_category_id: skillCategoryId,
        difficulty_level: DifficultyLevel.EASY,
      });
      performance = await this.studyTrailPerformanceRepository.save(performance);
    }

    return performance;
  }

  private async updateUserPerformance(userId: number, skillCategoryId: number, isCorrect: boolean, responseTime: number): Promise<void> {
    const performance = await this.getUserPerformance(userId, skillCategoryId);

    performance.total_questions_answered += 1;
    if (isCorrect) {
      performance.correct_answers += 1;
      performance.consecutive_correct_answers += 1;
      performance.consecutive_incorrect_answers = 0;
    } else {
      performance.incorrect_answers += 1;
      performance.consecutive_incorrect_answers += 1;
      performance.consecutive_correct_answers = 0;
    }

    performance.success_rate = (performance.correct_answers / performance.total_questions_answered) * 100;

    // Atualizar tempo médio de resposta
    const totalResponseTime = performance.average_response_time * (performance.total_questions_answered - 1) + responseTime;
    performance.average_response_time = totalResponseTime / performance.total_questions_answered;

    performance.last_activity_date = new Date();
    performance.updated_at = new Date();

    await this.studyTrailPerformanceRepository.save(performance);
  }

  private calculateXPReward(difficulty: DifficultyLevel): number {
    const baseXP = {
      [DifficultyLevel.EASY]: 50,
      [DifficultyLevel.MEDIUM]: 75,
      [DifficultyLevel.HARD]: 100,
    };
    return baseXP[difficulty];
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private async getStudyTrailSummary(trailId: number, userId: number): Promise<StudyTrailSummary> {
    const trail = await this.studyTrailRepository.findOne({
      where: { id: trailId, user_id: userId, is_active: true },
      relations: ['skill_category'],
    });

    if (!trail) {
      throw new NotFoundException('Trilha de estudos não encontrada');
    }

    return {
      id: trail.id,
      skill_category_id: trail.skill_category_id,
      skill_category_name: trail.skill_category?.name || 'Categoria',
      name: trail.name,
      status: trail.status,
      current_stop_position: trail.current_stop_position,
      total_stops: trail.total_stops,
      completion_percentage: trail.completion_percentage,
      total_xp_earned: trail.total_xp_earned,
      average_performance: trail.average_performance,
      created_at: trail.created_at,
      updated_at: trail.updated_at,
    };
  }

  // Método para trocar estratégia de seleção de dificuldade (modular)
  setDifficultyStrategy(strategy: DifficultySelectionStrategy): void {
    this.difficultyStrategy = strategy;
  }

  // Método para trocar estratégia por nome
  setDifficultyStrategyByName(strategyName: string): void {
    this.difficultyStrategy = DifficultyStrategyFactory.create(strategyName);
  }

  // Método para obter estratégias disponíveis
  getAvailableStrategies(): string[] {
    return DifficultyStrategyFactory.getAvailableStrategies();
  }
}
