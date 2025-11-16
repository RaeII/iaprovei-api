# Configuração do reCAPTCHA

## Variáveis de Ambiente Necessárias

Adicione a seguinte variável ao seu arquivo `.env`:

```env
RECAPTCHA_SECRET_KEY=sua_chave_secreta_do_recaptcha_aqui
```

## Como Obter a Chave Secreta

1. Acesse o [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Faça login com sua conta Google
3. Registre um novo site ou use um existente
4. Selecione **reCAPTCHA v2** > **"Não sou robô" Checkbox**
5. Adicione seus domínios (ex: `localhost`, `seudominio.com`)
6. Copie a **Chave Secreta** (Secret Key)
7. Adicione no arquivo `.env` do backend

## Chaves Utilizadas

- **Site Key (Frontend)**: `6LdMxQ4sAAAAAD7amAzg8FDwLWuDh6wKqcviYwNL`
- **Secret Key (Backend)**: Adicionar no `.env` como `RECAPTCHA_SECRET_KEY`

## Funcionamento

### Frontend (React Native)
- **Web**: Exibe o reCAPTCHA v2 real com checkbox "Não sou robô"
- **Mobile**: Mostra indicador visual de proteção ativa
- Token é enviado apenas quando disponível (Web)

### Backend (NestJS)
- Valida o token do reCAPTCHA quando presente
- Usa o `RecaptchaService` para comunicação com a API do Google
- Retorna erro se a validação falhar
- Remove o token antes de processar a subscription

## Segurança

- Token é validado no servidor usando HTTPS
- Logs de segurança são registrados
- Proteção contra ataques automatizados
- Fallback gracioso para mobile (sem reCAPTCHA)

## Testando

1. Configure a `RECAPTCHA_SECRET_KEY` no backend
2. Acesse a página de pagamentos via Web
3. Complete o reCAPTCHA
4. Verifique os logs do servidor para confirmação da validação
