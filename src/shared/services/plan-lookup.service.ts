import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '@/entities/plan.entity';
import { IPlanLookupService } from '@/shared/contracts/plan-lookup.contract';

/**
 * Serviço compartilhado para busca de planos
 * Usado por outros módulos para verificar existência e validade de planos
 * Implementa o princípio de Interface Segregation (SOLID)
 */
@Injectable()
export class SharedPlanLookupService implements IPlanLookupService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>
  ) {}

  /**
   * Busca um plano por ID com campos essenciais
   * Otimizado para retornar apenas os campos necessários
   */
  async findActivePlanById(planId: number): Promise<{ id: number; is_active: boolean; price: number; duration_in_days: number } | null> {
    const plan = await this.planRepository.findOne({
      where: { id: planId },
      select: { id: true, is_active: true, price: true, duration_in_days: true },
    });

    return plan;
  }

  /**
   * Verifica rapidamente se um plano existe e está ativo
   * Usa count para máxima performance
   */
  async existsAndIsActive(planId: number): Promise<boolean> {
    const count = await this.planRepository.count({
      where: { id: planId, is_active: true },
    });

    return count > 0;
  }
}
