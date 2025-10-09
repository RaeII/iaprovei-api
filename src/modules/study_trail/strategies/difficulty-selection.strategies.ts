/* eslint-disable @typescript-eslint/no-unused-vars */
import { DifficultyLevel } from '@/entities/question.entity';
import { StudyTrailPerformance } from '@/entities/study_trail_performance.entity';

export interface DifficultySelectionStrategy {
  selectDifficulty(performance: StudyTrailPerformance, lastStopPerformance?: number): DifficultyLevel;
}

/**
 * Estratégia adaptativa padrão - ajusta dificuldade baseada na performance
 */
export class AdaptiveDifficultyStrategy implements DifficultySelectionStrategy {
  selectDifficulty(performance: StudyTrailPerformance, lastStopPerformance?: number): DifficultyLevel {
    // Se é a primeira parada ou não há performance anterior, começar com fácil
    if (!performance || performance.total_questions_answered === 0) {
      return DifficultyLevel.EASY;
    }

    // Se teve boa performance na última parada (>= 80%), aumentar dificuldade
    if (lastStopPerformance && lastStopPerformance >= 80) {
      if (performance.success_rate >= 75) {
        return DifficultyLevel.HARD;
      } else if (performance.success_rate >= 60) {
        return DifficultyLevel.MEDIUM;
      }
      return DifficultyLevel.EASY;
    }

    // Se teve performance ruim na última parada (< 60%), manter mesma dificuldade
    if (lastStopPerformance && lastStopPerformance < 60) {
      // Manter a dificuldade baseada na performance geral
      if (performance.success_rate >= 70) {
        return DifficultyLevel.MEDIUM;
      }
      return DifficultyLevel.EASY;
    }

    // Performance média na última parada, ajustar baseado na performance geral
    if (performance.success_rate >= 80) {
      return DifficultyLevel.HARD;
    } else if (performance.success_rate >= 65) {
      return DifficultyLevel.MEDIUM;
    }
    return DifficultyLevel.EASY;
  }
}

/**
 * Estratégia progressiva - sempre aumenta a dificuldade gradualmente
 */
export class ProgressiveDifficultyStrategy implements DifficultySelectionStrategy {
  selectDifficulty(performance: StudyTrailPerformance, lastStopPerformance?: number): DifficultyLevel {
    if (!performance || performance.total_questions_answered === 0) {
      return DifficultyLevel.EASY;
    }

    const totalStops = Math.floor(performance.total_questions_answered / 10); // Assumindo 10 questões por parada

    // Progressão linear baseada no número de paradas completadas
    if (totalStops <= 2) {
      return DifficultyLevel.EASY;
    } else if (totalStops <= 4) {
      return DifficultyLevel.MEDIUM;
    } else {
      return DifficultyLevel.HARD;
    }
  }
}

/**
 * Estratégia conservadora - mantém dificuldade baixa até alta confiança
 */
export class ConservativeDifficultyStrategy implements DifficultySelectionStrategy {
  selectDifficulty(performance: StudyTrailPerformance, lastStopPerformance?: number): DifficultyLevel {
    if (!performance || performance.total_questions_answered === 0) {
      return DifficultyLevel.EASY;
    }

    // Só aumenta dificuldade com performance muito alta e consistente
    if (performance.success_rate >= 90 && performance.consecutive_correct_answers >= 15) {
      return DifficultyLevel.HARD;
    } else if (performance.success_rate >= 85 && performance.consecutive_correct_answers >= 10) {
      return DifficultyLevel.MEDIUM;
    }

    return DifficultyLevel.EASY;
  }
}

/**
 * Estratégia agressiva - aumenta dificuldade rapidamente
 */
export class AggressiveDifficultyStrategy implements DifficultySelectionStrategy {
  selectDifficulty(performance: StudyTrailPerformance, lastStopPerformance?: number): DifficultyLevel {
    if (!performance || performance.total_questions_answered === 0) {
      return DifficultyLevel.MEDIUM; // Já começa com médio
    }

    // Aumenta rapidamente a dificuldade
    if (performance.success_rate >= 60) {
      return DifficultyLevel.HARD;
    } else if (performance.success_rate >= 40) {
      return DifficultyLevel.MEDIUM;
    }

    return DifficultyLevel.EASY;
  }
}

/**
 * Estratégia baseada em tempo - considera velocidade de resposta
 */
export class TimeBasedDifficultyStrategy implements DifficultySelectionStrategy {
  selectDifficulty(performance: StudyTrailPerformance, lastStopPerformance?: number): DifficultyLevel {
    if (!performance || performance.total_questions_answered === 0) {
      return DifficultyLevel.EASY;
    }

    const avgResponseTime = performance.average_response_time;
    const successRate = performance.success_rate;

    // Se responde rápido E com alta precisão, aumentar dificuldade
    if (avgResponseTime <= 20 && successRate >= 80) {
      return DifficultyLevel.HARD;
    } else if (avgResponseTime <= 30 && successRate >= 70) {
      return DifficultyLevel.MEDIUM;
    } else if (avgResponseTime <= 45 && successRate >= 60) {
      return DifficultyLevel.MEDIUM;
    }

    return DifficultyLevel.EASY;
  }
}

/**
 * Factory para criar estratégias de dificuldade
 */
export class DifficultyStrategyFactory {
  static create(strategyType: string): DifficultySelectionStrategy {
    switch (strategyType.toLowerCase()) {
      case 'adaptive':
        return new AdaptiveDifficultyStrategy();
      case 'progressive':
        return new ProgressiveDifficultyStrategy();
      case 'conservative':
        return new ConservativeDifficultyStrategy();
      case 'aggressive':
        return new AggressiveDifficultyStrategy();
      case 'time-based':
        return new TimeBasedDifficultyStrategy();
      default:
        return new AdaptiveDifficultyStrategy(); // Padrão
    }
  }

  static getAvailableStrategies(): string[] {
    return ['adaptive', 'progressive', 'conservative', 'aggressive', 'time-based'];
  }
}
