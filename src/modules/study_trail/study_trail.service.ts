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
import { StudyTrailCreate, StudyTrailStopStart, StudyTrailStopAnswer, StudyTrailSummary, StudyTrailDetails, StudyTrailStopPerformance } from './schemas/study_trail.schema';

import { DifficultySelectionStrategy, AdaptiveDifficultyStrategy, DifficultyStrategyFactory } from './strategies/difficulty-selection.strategies';

@Injectable()
export class StudyTrailService {
  private performanceCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

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

  private getCacheKey(prefix: string, ...params: any[]): string {
    return `${prefix}:${params.join(':')}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.performanceCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.performanceCache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.performanceCache.set(key, { data, timestamp: Date.now() });
  }

  private invalidateCache(pattern: string): void {
    for (const key of this.performanceCache.keys()) {
      if (key.startsWith(pattern)) {
        this.performanceCache.delete(key);
      }
    }
  }

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

    // Buscar performance de cada parada
    const stopsWithPerformance = await Promise.all(
      stops.map(async stop => {
        const performance = await this.calculateStopPerformance(stop.id);
        return {
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
          performance: performance,
        };
      })
    );

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
      stops: stopsWithPerformance,
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

    // Verificar se a parada permite refazer (se não atingiu 70% de acerto)
    if (stopQuestion.answer_status !== QuestionAnswerStatus.NOT_ANSWERED) {
      // Verificar se a parada pode ser refeita
      const canRetry = await this.canRetryStop(answerData.study_trail_stop_id);
      if (!canRetry) {
        throw new BadRequestException('Esta questão já foi respondida e a parada não pode ser refeita');
      }

      // Resetar a questão para permitir nova tentativa
      stopQuestion.selected_option_id = null;
      stopQuestion.answer_status = QuestionAnswerStatus.NOT_ANSWERED;
      stopQuestion.response_time_seconds = 0;
      stopQuestion.used_hint = false;
      stopQuestion.confidence_level = null;
      stopQuestion.answered_at = null;
      stopQuestion.xp_earned = 0;
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

    // Salvar a questão primeiro para resposta rápida
    await this.studyTrailStopQuestionRepository.save(stopQuestion);
    const isLastQuestion = await this.isLastQuestionOfStop(stopQuestion.study_trail_stop_id);
    let performance = null;

    if (isLastQuestion) {
      // Processar operações pesadas de forma assíncrona (não bloquear resposta)
      await this.processAnswerAsync(stopQuestion.study_trail_stop_id, userId, stopQuestion.study_trail_stop.study_trail.skill_category_id, isCorrect, answerData.response_time_seconds || 0);
      performance = await this.calculateStopPerformance(stopQuestion.study_trail_stop_id);
    } else {
      this.processAnswerAsync(stopQuestion.study_trail_stop_id, userId, stopQuestion.study_trail_stop.study_trail.skill_category_id, isCorrect, answerData.response_time_seconds || 0);
    }
    // Preparar resposta básica imediatamente
    const response = {
      is_correct: isCorrect,
      xp_earned: stopQuestion.xp_earned,
      correct_option_id: correctOption?.id,
      explanation: stopQuestion.question.explanation,
      is_last_question: isLastQuestion,
      performance: performance,
    };

    return response;
  }

  private async processAnswerAsync(stopId: number, userId: number, skillCategoryId: number, isCorrect: boolean, responseTime: number): Promise<void> {
    // Processar operações pesadas de forma assíncrona sem bloquear a resposta
    try {
      // Atualizar estatísticas da parada
      await this.updateStopStatistics(stopId);

      // Atualizar performance do usuário
      await this.updateUserPerformance(userId, skillCategoryId, isCorrect, responseTime);
    } catch (error) {
      // Log do erro mas não falha a resposta principal
      console.error('Erro no processamento assíncrono da resposta:', error);
    }
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
    // Se a parada estava FAILED, resetar questões antes de iniciar
    if (stop.status === StudyTrailStopStatus.FAILED || stop.status === StudyTrailStopStatus.COMPLETED) {
      await this.resetStopQuestions(stop.id);
      // Resetar estatísticas da parada
      stop.questions_answered = 0;
      stop.correct_answers = 0;
      stop.success_rate = 0;
      stop.xp_earned = 0;
    }

    // Marcar parada como em progresso
    stop.status = StudyTrailStopStatus.IN_PROGRESS;
    stop.started_at = new Date();
    await this.studyTrailStopRepository.save(stop);

    // Buscar questões da parada com query otimizada
    const questions = await this.studyTrailStopQuestionRepository.createQueryBuilder('sq').leftJoinAndSelect('sq.question', 'q').leftJoinAndSelect('q.question_options', 'qo').where('sq.study_trail_stop_id = :stopId', { stopId: stop.id }).orderBy('sq.question_order', 'ASC').getMany();

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

  private async canRetryStop(stopId: number): Promise<boolean> {
    const stop = await this.studyTrailStopRepository.findOne({
      where: { id: stopId },
    });

    if (!stop) return false;

    // Pode refazer se:
    // 1. A parada está FAILED (não atingiu 70%)
    // 2. A parada está AVAILABLE (primeira tentativa)
    return stop.status === StudyTrailStopStatus.FAILED || stop.status === StudyTrailStopStatus.AVAILABLE;
  }

  private async resetStopQuestions(stopId: number): Promise<void> {
    await this.studyTrailStopQuestionRepository.update(
      { study_trail_stop_id: stopId },
      {
        selected_option_id: null,
        answer_status: QuestionAnswerStatus.NOT_ANSWERED,
        response_time_seconds: 0,
        used_hint: false,
        confidence_level: null,
        answered_at: null,
        xp_earned: 0,
      }
    );
  }

  private async isLastQuestionOfStop(stopId: number): Promise<boolean> {
    const stop = await this.studyTrailStopRepository.findOne({
      where: { id: stopId },
    });

    if (!stop) return false;

    const answeredQuestions = await this.studyTrailStopQuestionRepository.count({
      where: {
        study_trail_stop_id: stopId,
        answer_status: QuestionAnswerStatus.NOT_ANSWERED,
      },
    });

    return answeredQuestions === 0; // Se não há questões não respondidas, é a última
  }

  private async calculateStopPerformance(stopId: number): Promise<StudyTrailStopPerformance> {
    const stop = await this.studyTrailStopRepository.findOne({
      where: { id: stopId },
      relations: ['study_trail'],
    });

    if (!stop) {
      throw new NotFoundException('Parada não encontrada');
    }

    const questions = await this.studyTrailStopQuestionRepository.find({
      where: { study_trail_stop_id: stopId },
    });

    const answeredQuestions = questions.filter(q => q.answer_status !== QuestionAnswerStatus.NOT_ANSWERED);
    const correctAnswers = questions.filter(q => q.answer_status === QuestionAnswerStatus.CORRECT);
    const incorrectAnswers = questions.filter(q => q.answer_status === QuestionAnswerStatus.INCORRECT);

    const averageResponseTime = answeredQuestions.length > 0 ? answeredQuestions.reduce((sum, q) => sum + q.response_time_seconds, 0) / answeredQuestions.length : 0;

    const totalXP = questions.reduce((sum, q) => sum + q.xp_earned, 0);
    const successRate = answeredQuestions.length > 0 ? (correctAnswers.length / answeredQuestions.length) * 100 : 0;

    // Calcular nota baseada na performance
    const performanceGrade = this.calculatePerformanceGrade(successRate, averageResponseTime);

    // Calcular bônus
    const bonuses = this.calculateBonuses(questions, correctAnswers, averageResponseTime);

    // Verificar se pode fazer retry
    const canRetry = await this.canRetryStop(stopId);

    // Verificar se próxima parada foi desbloqueada
    const nextStopUnlocked = stop.status === StudyTrailStopStatus.COMPLETED;

    return {
      stop_id: stop.id,
      stop_name: stop.name,
      total_questions: stop.total_questions,
      questions_answered: answeredQuestions.length,
      correct_answers: correctAnswers.length,
      incorrect_answers: incorrectAnswers.length,
      success_rate: Math.round(successRate * 100) / 100,
      average_response_time: Math.round(averageResponseTime * 100) / 100,
      total_xp_earned: totalXP,
      is_completed: stop.status === StudyTrailStopStatus.COMPLETED,
      can_retry: canRetry,
      performance_grade: performanceGrade,
      next_stop_unlocked: nextStopUnlocked,
      streak_bonus: bonuses.streak,
      speed_bonus: bonuses.speed,
      accuracy_bonus: bonuses.accuracy,
    };
  }

  private calculatePerformanceGrade(successRate: number, averageResponseTime: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' | 'S' | null {
    if (successRate === 100 && averageResponseTime <= 10) return 'S';
    if (successRate >= 95 && averageResponseTime <= 20) return 'A+';
    if (successRate >= 90 && averageResponseTime <= 30) return 'A';
    if (successRate >= 85 && averageResponseTime <= 40) return 'B+';
    if (successRate >= 80 && averageResponseTime <= 50) return 'B';
    if (successRate >= 75 && averageResponseTime <= 60) return 'C+';
    if (successRate >= 70 && averageResponseTime <= 70) return 'C';
    if (successRate >= 60) return 'D';
    if (successRate) return 'F';
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private calculateBonuses(questions: any[], correctAnswers: any[], averageResponseTime: number): { streak: number; speed: number; accuracy: number } {
    // Bônus por sequência de acertos
    let maxStreak = 0;
    let currentStreak = 0;
    for (const q of questions) {
      if (q.answer_status === QuestionAnswerStatus.CORRECT) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    const streakBonus = Math.min(maxStreak * 2, 20); // Máximo 20 pontos

    // Bônus por velocidade (respostas rápidas)
    const fastAnswers = questions.filter(q => q.response_time_seconds <= 20).length;
    const speedBonus = Math.min(fastAnswers * 1, 15); // Máximo 15 pontos

    // Bônus por precisão (alta taxa de acerto)
    const accuracyRate = correctAnswers.length / questions.length;
    const accuracyBonus = accuracyRate >= 0.9 ? 10 : accuracyRate >= 0.8 ? 5 : 0;

    return {
      streak: streakBonus,
      speed: speedBonus,
      accuracy: accuracyBonus,
    };
  }

  private async updateStopStatistics(stopId: number): Promise<void> {
    // Usar query mais eficiente para calcular estatísticas
    const stats = await this.studyTrailStopQuestionRepository.createQueryBuilder('sq').select(['COUNT(CASE WHEN sq.answer_status != :notAnswered THEN 1 END) as answered_count', 'COUNT(CASE WHEN sq.answer_status = :correct THEN 1 END) as correct_count', 'SUM(sq.xp_earned) as total_xp']).where('sq.study_trail_stop_id = :stopId', { stopId }).setParameters({ notAnswered: QuestionAnswerStatus.NOT_ANSWERED, correct: QuestionAnswerStatus.CORRECT }).getRawOne();

    const stop = await this.studyTrailStopRepository.findOne({
      where: { id: stopId },
      relations: ['study_trail'],
    });

    if (!stop) return;

    const answeredCount = parseInt(stats.answered_count) || 0;
    const correctCount = parseInt(stats.correct_count) || 0;
    const totalXP = parseFloat(stats.total_xp) || 0;

    stop.questions_answered = answeredCount;
    stop.correct_answers = correctCount;
    stop.success_rate = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0;
    stop.xp_earned = totalXP;

    // Se todas as questões foram respondidas, verificar se pode ser concluída
    if (answeredCount === stop.total_questions) {
      // Se atingiu a performance mínima, marcar como completa
      if (stop.success_rate >= stop.minimum_success_rate) {
        stop.status = StudyTrailStopStatus.COMPLETED;
        stop.completed_at = new Date();

        // Desbloquear próxima parada de forma assíncrona
        this.unlockNextStopAsync(stop.study_trail_id, stop.position_order + 1, stop.study_trail.user_id, stop.study_trail.skill_category_id, stop.study_trail.total_stops);
      } else {
        // Se não atingiu 70%, marcar como FAILED (mantém histórico de performance)
        stop.status = StudyTrailStopStatus.FAILED;
        stop.completed_at = new Date();
      }
    }

    await this.studyTrailStopRepository.save(stop);
  }

  private async unlockNextStopAsync(trailId: number, nextPosition: number, userId: number, skillCategoryId: number, totalStops: number): Promise<void> {
    try {
      // Desbloquear próxima parada
      if (nextPosition <= totalStops) {
        await this.unlockNextStop(trailId, nextPosition, userId, skillCategoryId);
      }

      // Atualizar trilha se for a última parada
      if (nextPosition > totalStops) {
        await this.completeStudyTrail(trailId);
      }
    } catch (error) {
      console.error('Erro ao desbloquear próxima parada:', error);
    }
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
    const cacheKey = this.getCacheKey('user_performance', userId.toString(), skillCategoryId.toString());
    const cached = this.getFromCache<StudyTrailPerformance>(cacheKey);

    if (cached) {
      return cached;
    }

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

    this.setCache(cacheKey, performance);
    return performance;
  }

  private async updateUserPerformance(userId: number, skillCategoryId: number, isCorrect: boolean, responseTime: number): Promise<void> {
    // Usar query mais eficiente para atualizar performance
    const updateData: any = {
      total_questions_answered: () => 'total_questions_answered + 1',
      last_activity_date: new Date(),
      updated_at: new Date(),
    };

    if (isCorrect) {
      updateData.correct_answers = () => 'correct_answers + 1';
      updateData.consecutive_correct_answers = () => 'consecutive_correct_answers + 1';
      updateData.consecutive_incorrect_answers = 0;
    } else {
      updateData.incorrect_answers = () => 'incorrect_answers + 1';
      updateData.consecutive_incorrect_answers = () => 'consecutive_incorrect_answers + 1';
      updateData.consecutive_correct_answers = 0;
    }

    // Atualizar performance usando query builder para operações atômicas
    await this.studyTrailPerformanceRepository.createQueryBuilder().update().set(updateData).where('user_id = :userId AND skill_category_id = :skillCategoryId', { userId, skillCategoryId }).execute();

    // Atualizar campos calculados separadamente
    await this.studyTrailPerformanceRepository
      .createQueryBuilder()
      .update()
      .set({
        success_rate: () => '(correct_answers / total_questions_answered) * 100',
        average_response_time: () => '((average_response_time * (total_questions_answered - 1)) + :responseTime) / total_questions_answered',
      })
      .where('user_id = :userId AND skill_category_id = :skillCategoryId', { userId, skillCategoryId })
      .setParameter('responseTime', responseTime)
      .execute();

    // Invalidar cache de performance do usuário
    this.invalidateCache(`user_performance:${userId}:${skillCategoryId}`);
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

  async retryStop(stopId: number, userId: number): Promise<any> {
    // Verificar se a parada existe e pertence ao usuário
    const stop = await this.studyTrailStopRepository.findOne({
      where: { id: stopId },
      relations: ['study_trail'],
    });

    if (!stop || stop.study_trail.user_id !== userId) {
      throw new NotFoundException('Parada não encontrada ou não pertence ao usuário');
    }

    // Verificar se a parada pode ser reiniciada
    const canRetry = await this.canRetryStop(stopId);
    if (!canRetry) {
      throw new BadRequestException('Esta parada não pode ser reiniciada');
    }

    // Resetar a parada para AVAILABLE (questões serão resetadas no próximo start)
    stop.status = StudyTrailStopStatus.AVAILABLE;
    stop.started_at = null;
    stop.completed_at = null;

    await this.studyTrailStopRepository.save(stop);

    // NÃO resetar questões aqui - serão resetadas quando iniciar novamente

    return {
      message: 'Parada reiniciada com sucesso',
      stop_id: stopId,
      status: stop.status,
    };
  }

  async getStopPerformance(stopId: number, userId: number): Promise<StudyTrailStopPerformance> {
    // Verificar se a parada existe e pertence ao usuário
    const stop = await this.studyTrailStopRepository.findOne({
      where: { id: stopId },
      relations: ['study_trail'],
    });

    if (!stop || stop.study_trail.user_id !== userId) {
      throw new NotFoundException('Parada não encontrada ou não pertence ao usuário');
    }

    return this.calculateStopPerformance(stopId);
  }
}
