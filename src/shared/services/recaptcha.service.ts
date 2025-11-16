import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

@Injectable()
export class RecaptchaService {
  private readonly logger = new Logger(RecaptchaService.name);
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.RECAPTCHA_SECRECT_KEY || '';

    if (!this.secretKey) {
      this.logger.warn('RECAPTCHA_SECRET_KEY não foi configurada nas variáveis de ambiente');
    }
  }

  /**
   * Valida o token do reCAPTCHA com a API do Google
   * @param token - Token do reCAPTCHA recebido do frontend
   * @param remoteIp - IP do cliente (opcional)
   * @returns Promise<boolean> - true se válido, false caso contrário
   */
  async validateToken(token: string, remoteIp?: string): Promise<boolean> {
    if (!this.secretKey) {
      this.logger.error('RECAPTCHA_SECRET_KEY não configurada');
      return false;
    }

    if (!token || token.trim() === '') {
      this.logger.warn('Token do reCAPTCHA está vazio');
      return false;
    }

    try {
      const params = new URLSearchParams({
        secret: this.secretKey,
        response: token,
      });

      if (remoteIp) {
        params.append('remoteip', remoteIp);
      }

      const response = await axios.post<RecaptchaResponse>('https://www.google.com/recaptcha/api/siteverify', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000, // 10 segundos de timeout
      });

      const { success, 'error-codes': errorCodes } = response.data;

      if (!success) {
        this.logger.warn('Validação do reCAPTCHA falhou', {
          errorCodes,
          token: token.substring(0, 20) + '...', // Log apenas parte do token por segurança
        });
        return false;
      }

      this.logger.log('reCAPTCHA validado com sucesso');
      return true;
    } catch (error) {
      this.logger.error('Erro ao validar reCAPTCHA', {
        error: error.message,
        stack: error.stack,
      });
      return false;
    }
  }

  /**
   * Verifica se o serviço reCAPTCHA está configurado corretamente
   * @returns boolean - true se configurado, false caso contrário
   */
  isConfigured(): boolean {
    return !!this.secretKey;
  }
}
