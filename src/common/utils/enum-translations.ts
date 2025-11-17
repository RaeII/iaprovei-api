import { ContestStatus, DifficultyLevel } from '@/entities/contest.entity';

export const CONTEST_STATUS_TRANSLATIONS: Record<ContestStatus, string> = {
  [ContestStatus.AVAILABLE]: 'Disponível',
  [ContestStatus.COMING_SOON]: 'Em breve',
  [ContestStatus.DRAFT]: 'Rascunho',
};

export const DIFFICULTY_LEVEL_TRANSLATIONS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.BEGINNER]: 'Iniciante',
  [DifficultyLevel.INTERMEDIARY]: 'Intermediário',
  [DifficultyLevel.ADVANCED]: 'Avançado',
};

/**
 * Translates contest status to Portuguese
 */
export function translateContestStatus(status: ContestStatus): string {
  return CONTEST_STATUS_TRANSLATIONS[status];
}

/**
 * Translates difficulty level to Portuguese
 */
export function translateDifficultyLevel(level: DifficultyLevel): string {
  return DIFFICULTY_LEVEL_TRANSLATIONS[level];
}

/**
 * Adds Portuguese translations to contest object
 */
export function addContestTranslations<T extends { status: ContestStatus; difficulty_level: DifficultyLevel }>(
  contest: T
): T & { status_translated: string; difficulty_level_translated: string } {
  return {
    ...contest,
    status_translated: translateContestStatus(contest.status),
    difficulty_level_translated: translateDifficultyLevel(contest.difficulty_level),
  };
}
