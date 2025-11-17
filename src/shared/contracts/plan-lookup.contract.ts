/**
 * Interface para serviço de busca compartilhada de planos
 * Usado por outros módulos para verificar existência e validade de planos
 * sem criar dependências circulares
 */
export interface IPlanLookupService {
  /**
   * Busca um plano por ID com campos mínimos necessários
   * @param planId ID do plano
   * @returns Objeto com is_active ou null se não existir
   */
  findActivePlanById(
    planId: number
  ): Promise<{ id: number; is_active: boolean; id_pagbank: string; description_topics?: string } | null>;

  /**
   * Verifica se um plano existe e está ativo
   * @param planId ID do plano
   * @returns true se o plano existir e estiver ativo
   */
  existsAndIsActive(planId: number): Promise<boolean>;
}
