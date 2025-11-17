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
   * Verifica se um plano com o id_pagbank especificado já existe
   * @param idPagbank ID do PagBank
   * @param excludeId ID do plano a ser excluído da verificação (para updates)
   * @throws ConflictException se o plano já existir
   */
  async assertIdPagbankIsNotAlreadyInUse(idPagbank: string, excludeId?: number): Promise<void> {
    const queryBuilder = this.planRepository
      .createQueryBuilder('plan')
      .where('plan.id_pagbank = :idPagbank', { idPagbank })
      .select('plan.id');

    if (excludeId) {
      queryBuilder.andWhere('plan.id != :excludeId', { excludeId });
    }

    const existingPlan = await queryBuilder.getOne();

    if (existingPlan) {
      throw new ConflictException(`Plano com o ID PagBank "${idPagbank}" já existe`);
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
}
