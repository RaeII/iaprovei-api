import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { PublicKeys, CreatePlan, PlanResponse, GetPlansData, CreateCustomer, CustomerResponse, CreateSubscription, SubscriptionResponse, UpdateNotifications } from './schemas/pagbank.schema';

@Injectable()
export class PagbankService {
  private readonly logger = new Logger(PagbankService.name);
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    const baseUrl = process.env.URL_API_PAGBANK;
    const token = process.env.TOKEN_TEST_PAGBANK;

    if (!token) {
      this.logger.warn('TOKEN_TEST_PAGBANK não foi configurado nas variáveis de ambiente');
    }

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      timeout: 60000,
    });
  }

  /**
   * Método padrão para realizar requisições à API do PagBank
   * @param endpoint - Endpoint da API (ex: 'oauth2/application')
   * @param method - Método HTTP (GET, POST, PUT, DELETE)
   * @param body - Corpo da requisição (opcional)
   * @param additionalHeaders - Headers adicionais (opcional)
   * @returns Promise com a resposta da API
   */
  private async request<T = any>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any, additionalHeaders?: Record<string, string>): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      data: body,
      headers: additionalHeaders,
    };

    try {
      const response = await this.axiosInstance.request<T>(config);

      console.log('response', response.data);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        const errorData = axiosError.response?.data;

        this.logger.error(`\n\n Erro na requisição PagBank: ${status} - \n\n ${JSON.stringify(errorData)} \n\n`, axiosError.stack, '\n\n');

        throw new InternalServerErrorException(`Erro ao comunicar com PagBank: ${status} - ${axiosError.message}`);
      }

      throw new InternalServerErrorException('Erro ao comunicar com o PagBank');
    }
  }

  /**
   * Obtém as chaves públicas do PagBank
   * @returns Promise com os dados da aplicação criada
   */
  async GetPublicKeys(): Promise<PublicKeys> {
    return await this.request('public-keys', 'GET');
  }

  /**
   * Cria um novo plano de assinatura no PagBank
   * @param planData - Dados do plano a ser criado
   * @returns Promise com os dados do plano criado
   */
  async createPlan(planData: CreatePlan): Promise<PlanResponse> {
    return await this.request('plans', 'POST', planData);
  }

  /**
   * Busca todos os planos de assinatura do PagBank
   * @returns Promise com a lista de planos
   */
  async getPlans(): Promise<GetPlansData> {
    return await this.request('plans', 'GET');
  }

  /**
   * Atualiza um plano de assinatura existente no PagBank
   * @param planId - ID do plano a ser atualizado
   * @param planData - Dados do plano a serem atualizados
   * @returns Promise com os dados do plano atualizado
   */
  async updatePlan(planId: string, planData: CreatePlan): Promise<PlanResponse> {
    return await this.request(`plans/${planId}`, 'PUT', planData);
  }

  /**
   * Cria um novo customer (assinante) no PagBank
   * @param customerData - Dados do customer a ser criado
   * @returns Promise com os dados do customer criado
   */
  async createCustomer(customerData: CreateCustomer): Promise<CustomerResponse> {
    return await this.request('customers', 'POST', customerData);
  }

  /**
   * Cria uma nova subscription (assinatura) no PagBank
   * @param subscriptionData - Dados da subscription a ser criada
   * @returns Promise com os dados da subscription criada
   */
  async createSubscription(subscriptionData: CreateSubscription): Promise<SubscriptionResponse> {
    const response = await this.request<SubscriptionResponse>('subscriptions', 'POST', subscriptionData);
    console.log('\n\nresponse', response, '\n\n');
    return response;
  }

  /**
   * Obtém as configurações de notificações no PagBank
   * @returns Promise com a resposta da API do PagBank
   */
  async getNotifications(): Promise<unknown> {
    return await this.request('preferences/notifications', 'GET');
  }

  /**
   * Atualiza as configurações de notificações no PagBank
   * @param notificationData - Dados das notificações a serem atualizadas
   * @returns Promise com a resposta da API do PagBank
   */
  async updateNotifications(notificationData: UpdateNotifications): Promise<unknown> {
    console.log(notificationData);
    return await this.request('preferences/notifications', 'PUT', notificationData);
  }
}
