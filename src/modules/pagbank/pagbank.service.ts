import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as crypto from 'crypto';
import {
  PublicKeys,
  CreatePlan,
  PlanResponse,
  GetPlansData,
  CreateCustomer,
  CreateCustomerSimple,
  CustomerResponse,
  CreateSubscription,
  SubscriptionResponse,
  UpdateNotifications,
  UpdateCustomerBillingInfo,
  GetSubscriptionsQuery,
  GetSubscriptionsData,
  OAuth2TokenResponse,
  CertificateResponse,
} from './schemas/pagbank.schema';

@Injectable()
export class PagbankService {
  private readonly logger = new Logger(PagbankService.name);
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    const baseUrl = process.env.URL_API_PAGBANK;
    const token = process.env.TOKEN_PAGBANK;

    if (!token) {
      this.logger.warn('TOKEN_TEST_PAGBANK não foi configurado nas variáveis de ambiente');
    }

    const httpsAgent = this.getHttpsAgent();

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      timeout: 60000,
      httpsAgent,
    });
  }

  /**
   * Carrega o agente HTTPS com o certificado digital se existir
   */
  private getHttpsAgent(): https.Agent | undefined {
    try {
      const certDir = path.join(process.cwd(), 'keys', 'certificate');
      const certPath = path.join(certDir, 'cert.pem');
      const keyPath = path.join(certDir, 'key.pem');

      console.log('certPath', certPath);
      console.log('keyPath', keyPath);

      if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        const cert = fs.readFileSync(certPath);
        const key = fs.readFileSync(keyPath);

        console.log('cert', cert);
        console.log('key', key);

        this.logger.log('Certificado digital PagBank carregado com sucesso.');
        return new https.Agent({
          cert,
          key,
        });
      }
    } catch (error) {
      this.logger.warn('Não foi possível carregar o certificado digital do PagBank:', error);
    }
    return undefined;
  }

  /**
   * Método padrão para realizar requisições à API do PagBank
   * @param endpoint - Endpoint da API (ex: 'oauth2/application')
   * @param method - Método HTTP (GET, POST, PUT, DELETE)
   * @param body - Corpo da requisição (opcional)
   * @param additionalHeaders - Headers adicionais (opcional)
   * @returns Promise com a resposta da API
   */
  private async request<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      data: body,
      headers: additionalHeaders,
    };

    /* const fullUrl = `${this.axiosInstance.defaults.baseURL}${endpoint}`; */

    try {
      // Log da requisição
      /* console.log('\n' + '='.repeat(80));
      console.log('📤 PAGBANK REQUEST');
      console.log('='.repeat(80));
      console.log(`Método: ${method}`);
      console.log(`URL: ${fullUrl}`);

      if (body) {
        console.log('\nPayload:');
        console.log(JSON.stringify(body, null, 2));
      } else {
        console.log('\nPayload: {}');
      } 
        console.log('='.repeat(80) + '\n');
      */

      const response = await this.axiosInstance.request<T>(config);

      // Log da resposta
      /* console.log('\n' + '='.repeat(80));
      console.log('='.repeat(80));
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('\nResposta:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('='.repeat(80) + '\n'); */

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorData = axiosError.response?.data;

        console.log('\n📦 Erro:');
        console.log(JSON.stringify(errorData, null, 2));
        console.log('='.repeat(80) + '\n');

        throw errorData;
      }

      throw error;
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
   * Atualiza as chaves públicas do PagBank
   * @returns Promise com os dados da aplicação criada
   */
  async PutPublicKeys(): Promise<PublicKeys> {
    return await this.request('public-keys', 'PUT');
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
  async createCustomer(customerData: CreateCustomer | CreateCustomerSimple): Promise<CustomerResponse> {
    return await this.request('customers', 'POST', customerData);
  }

  /**
   * Cria uma nova subscription (assinatura) no PagBank
   * @param subscriptionData - Dados da subscription a ser criada
   * @returns Promise com os dados da subscription criada
   */
  async createSubscription(subscriptionData: CreateSubscription): Promise<SubscriptionResponse> {
    const response = await this.request<SubscriptionResponse>('subscriptions', 'POST', subscriptionData);
    return response;
  }

  /**
   * Cancela uma assinatura existente no PagBank
   * @param subscriberId - ID do assinante (subscriber) retornado pelo PagBank
   * @returns Promise com a resposta da API do PagBank
   */
  async cancelSubscription(subscriberId: string): Promise<unknown> {
    return await this.request(`subscriptions/${subscriberId}/cancel`, 'PUT');
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
    return await this.request('preferences/notifications', 'PUT', notificationData);
  }

  /**
   * Atualiza as informações de cobrança de um customer existente no PagBank
   * @param customerId - ID do customer a ter as informações de cobrança atualizadas
   * @param billingInfoData - Array com as novas informações de cobrança
   * @returns Promise com a resposta da API do PagBank
   */
  async updateCustomerBillingInfo(customerId: string, billingInfoData: UpdateCustomerBillingInfo[]): Promise<unknown> {
    return await this.request(`customers/${customerId}/billing_info`, 'PUT', billingInfoData);
  }

  /**
   * Busca subscriptions (assinaturas) do PagBank com filtros opcionais
   * @param queryParams - Parâmetros de filtro para a busca
   * @returns Promise com a lista de subscriptions filtradas
   */
  async getSubscriptions(queryParams: GetSubscriptionsQuery): Promise<GetSubscriptionsData> {
    const params = new URLSearchParams();

    if (queryParams.reference_id) {
      params.append('reference_id', queryParams.reference_id);
    }

    if (queryParams.status && queryParams.status.length > 0) {
      queryParams.status.forEach(status => {
        params.append('status', status);
      });
    }

    if (queryParams.payment_method_type && queryParams.payment_method_type.length > 0) {
      queryParams.payment_method_type.forEach(type => {
        params.append('payment_method_type', type);
      });
    }

    if (queryParams.created_at_start) {
      params.append('created_at_start', queryParams.created_at_start);
    }

    if (queryParams.created_at_end) {
      params.append('created_at_end', queryParams.created_at_end);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `subscriptions?${queryString}` : 'subscriptions';

    return await this.request<GetSubscriptionsData>(endpoint, 'GET');
  }

  /**
   * Carrega a chave pública RSA do arquivo local
   * @returns Objeto com a chave pública e timestamp de criação
   */
  async getLocalPublicKey(): Promise<PublicKeys> {
    try {
      // Caminho para o arquivo da chave pública (relativo ao diretório raiz do projeto)
      const publicKeyPath = path.join(process.cwd(), 'keys', 'public.pem');

      // Verificar se o arquivo existe
      if (!fs.existsSync(publicKeyPath)) {
        throw new Error('Chave pública não encontrada. Execute: npx ts-node key.ts para gerar as chaves.');
      }

      // Carregar a chave pública
      const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

      // Obter informações do arquivo para o timestamp
      const stats = fs.statSync(publicKeyPath);
      const createdAt = stats.birthtime.getTime();

      return {
        public_key: publicKey,
        created_at: createdAt,
      };
    } catch (error) {
      this.logger.error('Erro ao carregar chave pública local:', error);
      throw error;
    }
  }

  /**
   * Solicita um token OAuth2 para criação de certificados no PagBank
   * @returns Promise com a resposta da API do PagBank contendo o token e o challenge descriptografado
   */
  async requestOAuth2Token(): Promise<OAuth2TokenResponse> {
    const body = {
      grant_type: 'challenge',
      scope: 'certificate.create',
    };

    const response = await this.request<OAuth2TokenResponse>('oauth2/token', 'POST', body);

    if (response.challenge) {
      response.decrypted_challenge = this.decryptChallenge(response.challenge);
    }

    return response;
  }

  /**
   * Descriptografa o challenge retornado pelo PagBank
   * @param encryptedChallenge - Challenge criptografado em base64
   * @returns Challenge descriptografado
   */
  decryptChallenge(encryptedChallenge: string): string {
    try {
      const privateKeyPath = path.join(process.cwd(), 'keys', 'private.pem');

      if (!fs.existsSync(privateKeyPath)) {
        throw new Error('Chave privada não encontrada em ' + privateKeyPath);
      }

      const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf8');
      const privateKey = crypto.createPrivateKey({ key: privateKeyPem });

      const decryptedData = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(encryptedChallenge, 'base64')
      );

      return decryptedData.toString();
    } catch (error) {
      this.logger.error('Erro ao descriptografar challenge:', error);
      throw error;
    }
  }

  /**
   * Cria um novo certificado no PagBank
   * @returns Promise com a resposta da API do PagBank
   */
  async createCertificate(): Promise<CertificateResponse> {
    const tokenData = await this.requestOAuth2Token();

    if (!tokenData.decrypted_challenge) {
      throw new Error('Não foi possível obter o challenge descriptografado.');
    }

    const response = await this.request<CertificateResponse>('certificates', 'POST', null, {
      X_CHALLENGE: tokenData.decrypted_challenge,
      Authorization: `Bearer ${tokenData.access_token}`,
    });

    if (response.key && response.pem) {
      try {
        const keyBuffer = Buffer.from(response.key, 'base64');
        const pemBuffer = Buffer.from(response.pem, 'base64');
        const certDir = path.join(process.cwd(), 'keys', 'certificate');

        if (!fs.existsSync(certDir)) {
          fs.mkdirSync(certDir, { recursive: true });
        }

        fs.writeFileSync(path.join(certDir, 'key.pem'), keyBuffer);
        fs.writeFileSync(path.join(certDir, 'cert.pem'), pemBuffer);

        this.logger.log(`Certificados salvos com sucesso em: ${certDir}`);

        // Atualiza o agente HTTPS para usar o novo certificado nas próximas requisições
        this.axiosInstance.defaults.httpsAgent = this.getHttpsAgent();
      } catch (error) {
        this.logger.error('Erro ao salvar certificados:', error);
        // Não lançamos erro aqui para não impedir o retorno da resposta da API,
        // mas logamos o problema.
      }
    }

    return response;
  }
}
