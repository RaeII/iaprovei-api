import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan as PlanEntity } from '@/entities/plan.entity';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import { PlanListData, PlanDetail, PlanActive, PlanListDataSchema, PlanCreate, PlanUpdate } from './schemas/plan.schema';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(PlanEntity)
    private plansRepository: Repository<PlanEntity>
  ) {}

  /**
   * Busca todos os planos (ativos e inativos)
   * @returns Lista completa de planos
   */
  async findAll(): Promise<PlanListData[]> {
    return this.plansRepository.find({
      select: Object.keys(PlanListDataSchema.shape) as (keyof PlanEntity)[],
    });
  }

  /**
   * Busca apenas planos ativos
   * @returns Lista de planos ativos
   */
  async findAllActive(): Promise<PlanActive[]> {
    return this.plansRepository.find({
      where: { is_active: true },
      select: ['id', 'id_pagbank', 'title', 'description', 'description_topics', 'is_active'],
    });
  }

  /**
   * Busca um plano por ID
   * @param id ID do plano
   * @returns Detalhes do plano
   * @throws DataNotFoundException se o plano não for encontrado
   */
  async findOne(id: number): Promise<PlanDetail> {
    const plan = await this.plansRepository.findOne({
      where: { id },
      select: Object.keys(PlanListDataSchema.shape) as (keyof PlanEntity)[],
    });

    if (!plan) {
      throw new DataNotFoundException(`Plan with id "${id}"`, 'Plano', PlansService.name);
    }

    return plan;
  }

  /**
   * Busca um plano ativo por ID
   * @param id ID do plano
   * @returns Detalhes do plano ativo
   * @throws DataNotFoundException se o plano não for encontrado ou não estiver ativo
   */
  async findOneActive(id: number): Promise<PlanActive> {
    const plan = await this.plansRepository.findOne({
      where: { id, is_active: true },
      select: ['id', 'id_pagbank', 'title', 'description', 'description_topics', 'is_active'],
    });

    if (!plan) {
      throw new DataNotFoundException(`Active plan with id "${id}"`, 'Plano ativo', PlansService.name);
    }

    return plan;
  }

  /**
   * Busca um plano por nome
   * @param name Nome do plano
   * @returns Plano encontrado ou null
   */
  async findByIdPagbank(idPagbank: string): Promise<PlanDetail | null> {
    return this.plansRepository.findOne({
      where: { id_pagbank: idPagbank },
      select: Object.keys(PlanListDataSchema.shape) as (keyof PlanEntity)[],
    });
  }

  /**
   * Verifica se um plano existe e está ativo
   * @param id ID do plano
   * @returns true se o plano existir e estiver ativo
   */
  async existsAndIsActive(id: number): Promise<boolean> {
    const count = await this.plansRepository.count({
      where: { id, is_active: true },
    });
    return count > 0;
  }

  /**
   * Busca planos por faixa de preço
   * @param minPrice Preço mínimo
   * @param maxPrice Preço máximo
   * @returns Lista de planos na faixa de preço
   */
  async findByDescriptionTopics(searchTerm: string): Promise<PlanActive[]> {
    return this.plansRepository
      .createQueryBuilder('plan')
      .where('plan.description_topics LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .andWhere('plan.is_active = :isActive', { isActive: true })
      .select(['plan.id', 'plan.id_pagbank', 'plan.title', 'plan.description', 'plan.description_topics', 'plan.is_active'])
      .getMany();
  }

  /**
   * Busca planos por duração
   * @param durationInDays Duração em dias
   * @returns Lista de planos com a duração especificada
   */
  async findByIdPagbankPattern(pattern: string): Promise<PlanActive[]> {
    return this.plansRepository.find({
      where: { id_pagbank: pattern, is_active: true },
      select: ['id', 'id_pagbank', 'title', 'description', 'description_topics', 'is_active'],
    });
  }

  /**
   * Cria um novo plano
   * @param createPlanDto Dados para criação do plano
   * @returns Plano criado
   */
  async create(createPlanDto: PlanCreate): Promise<PlanDetail> {
    const newPlan = this.plansRepository.create({
      ...createPlanDto,
      is_active: true,
    } as Partial<PlanEntity>);

    const savedPlan = await this.plansRepository.save(newPlan);

    // Retorna o plano criado com todos os campos
    return this.findOne(savedPlan.id);
  }

  /**
   * Atualiza um plano existente
   * @param id ID do plano
   * @param updatePlanDto Dados para atualização
   * @returns Plano atualizado
   */
  async update(id: number, updatePlanDto: PlanUpdate): Promise<PlanDetail> {
    const plan = await this.plansRepository.findOne({ where: { id } });

    if (!plan) {
      throw new DataNotFoundException(`Plan with id "${id}"`, 'Plano', PlansService.name);
    }

    // Aplica as atualizações
    Object.assign(plan, updatePlanDto);

    await this.plansRepository.save(plan);

    // Retorna o plano atualizado
    return this.findOne(id);
  }

  /**
   * Remove um plano (soft delete - marca como inativo)
   * @param id ID do plano
   */
  async remove(id: number): Promise<void> {
    const result = await this.plansRepository.update(id, { is_active: false });

    if (result.affected === 0) {
      throw new DataNotFoundException(`Plan with id "${id}"`, 'Plano', PlansService.name);
    }
  }

  /**
   * Remove um plano permanentemente (hard delete)
   * @param id ID do plano
   */
  async hardDelete(id: number): Promise<void> {
    const result = await this.plansRepository.delete(id);

    if (result.affected === 0) {
      throw new DataNotFoundException(`Plan with id "${id}"`, 'Plano', PlansService.name);
    }
  }
}
