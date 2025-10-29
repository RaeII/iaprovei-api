import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '@/entities/plan.entity';
import { ConflictException } from '@nestjs/common';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';

/**
 * Validador de planos - Segue o princípio Single Responsibility (SOLID)
 * Centraliza todas as validações relacionadas a planos
 */
@Injectable()
export class PlanValidator {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>
  ) {}

  /**
   * Verifica se um plano com o nome especificado já existe
   * @param name Nome do plano
   * @param excludeId ID do plano a ser excluído da verificação (para updates)
   * @throws ConflictException se o plano já existir
   */
  async assertNameIsNotAlreadyInUse(name: string, excludeId?: number): Promise<void> {
    const queryBuilder = this.planRepository.createQueryBuilder('plan').where('plan.name = :name', { name }).select('plan.id');

    if (excludeId) {
      queryBuilder.andWhere('plan.id != :excludeId', { excludeId });
    }

    const existingPlan = await queryBuilder.getOne();

    if (existingPlan) {
      throw new ConflictException(`Plano com o nome "${name}" já existe`);
    }
  }

  /**
   * Verifica se um plano existe
   * @param id ID do plano
   * @throws DataNotFoundException se o plano não existir
   */
  async assertPlanExists(id: number): Promise<void> {
    const exists = await this.planRepository.count({
      where: { id },
    });

    if (exists === 0) {
      throw new DataNotFoundException(`Plan with id "${id}"`, 'Plano', PlanValidator.name);
    }
  }

  /**
   * Verifica se um plano existe e está ativo
   * @param id ID do plano
   * @throws DataNotFoundException se o plano não existir ou não estiver ativo
   */
  async assertPlanExistsAndIsActive(id: number): Promise<void> {
    const exists = await this.planRepository.count({
      where: { id, is_active: true },
    });

    if (exists === 0) {
      throw new DataNotFoundException(`Active plan with id "${id}"`, 'Plano ativo', PlanValidator.name);
    }
  }

  /**
   * Valida se o preço é positivo
   * @param price Preço
   * @throws ConflictException se o preço for inválido
   */
  assertPriceIsValid(price: number): void {
    if (price <= 0) {
      throw new ConflictException('O preço do plano deve ser maior que zero');
    }
  }

  /**
   * Valida se a duração é válida
   * @param durationInDays Duração em dias
   * @throws ConflictException se a duração for inválida
   */
  assertDurationIsValid(durationInDays: number): void {
    if (durationInDays <= 0) {
      throw new ConflictException('A duração do plano deve ser maior que zero');
    }
  }
}
