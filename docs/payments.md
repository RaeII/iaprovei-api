Inicio -> https://portaldev.pagbank.com.br/primeiros-passos
Tokens -> https://portaldev.pagbank.com.br/tokens
Cartões de teste -> https://developer.pagbank.com.br/docs/cartoes-de-teste
Pagamentos recorrente dash -> https://sandbox.assinaturas.pagseguro.uol.com.br/dashboard

Pagamentos recorrentes doc -> https://developer.pagbank.com.br/docs/painel-de-pagamentos-recorrentes

Pagamentos recorrentes doc api -> https://developer.pagbank.com.br/reference/consultar-chave-publica-pagamento-recorrentez



# 1 Criar chave pública

- A chave publica será utilizado nas requisições aos endpoints de Pagamento Recorrente do PagBank

```
curl --request PUT \
     --url https://sandbox.api.assinaturas.pagseguro.com/public-keys \
     --header 'Authorization: Bearer <token>' \
     --header 'accept: application/json'
```

- Renovar a chave publica até 2 anos
- A chave publica só pode ser renovada depois de 7 dias

# 2 notificações

- As notificações de uma assinatura de plano pode ser enviado por email e webhook (Pagbank envia endpoint da api)

API Notificação -> https://developer.pagbank.com.br/reference/consultar-preferencias-notificacoes
Doc Notificação -> https://developer.pagbank.com.br/docs/preferencias-de-notificacao
Doc webhook -> https://developer.pagbank.com.br/reference/webhooks-assinaturas

# Criar plano

{
  "reference_id": "Pro2990",
  "name": "iaProvei Pro",
  "description": "Plano Pro, acesso à todos módulos de estudo e vida infinitas",
  "amount": {
    "value": 2999,
    "currency": "BRL"
  },
  "interval": {
    "unit": "MONTH",
    "length": 1
  },
  "trial": {
    "days": 3,
    "enabled": true,
    "hold_setup_fee": true
  },
  "payment_method": [
    "CREDIT_CARD"
  ],
  "editable": true
}

Resposta:
{
  "data": {
    "id": "PLAN_32B721A9-4EA3-4A27-9BBB-23B2B0EDC7DC",
    "reference_id": "Pro2990",
    "status": "ACTIVE",
    "name": "iaProvei Pro",
    "description": "Plano Pro, acesso à todos módulos de estudo e vida infinitas",
    "amount": {
      "value": 2999,
      "currency": "BRL"
    },
    "interval": {
      "length": 12,
      "unit": "MONTH"
    },
    "trial": {
      "days": 3,
      "enabled": true,
      "hold_setup_fee": true
    },
    "payment_method": [
      "CREDIT_CARD"
    ],
    "created_at": "2025-10-31T17:21:32.667-03:00",
    "updated_at": "2025-10-31T17:21:32.667-03:00",
    "editable": true,
    "links": [
      {
        "rel": "SELF",
        "href": "http://sandbox.api.assinaturas.pagseguro.com/plans/PLAN_32B721A9-4EA3-4A27-9BBB-23B2B0EDC7DC",
        "media": "application/json",
        "type": "GET"
      },
      {
        "rel": "SELF",
        "href": "http://sandbox.api.assinaturas.pagseguro.com/plans",
        "media": "application/json",
        "type": "GET"
      },
      {
        "rel": "SELF",
        "href": "http://sandbox.api.assinaturas.pagseguro.com/plans/PLAN_32B721A9-4EA3-4A27-9BBB-23B2B0EDC7DC/activate",
        "media": "application/json",
        "type": "PUT"
      },
      {
        "rel": "SELF",
        "href": "http://sandbox.api.assinaturas.pagseguro.com/plans/PLAN_32B721A9-4EA3-4A27-9BBB-23B2B0EDC7DC/inactivate",
        "media": "application/json",
        "type": "PUT"
      },
      {
        "rel": "SELF",
        "href": "http://sandbox.api.assinaturas.pagseguro.com/plans/PLAN_32B721A9-4EA3-4A27-9BBB-23B2B0EDC7DC",
        "media": "application/json",
        "type": "PUT"
      }
    ]
  }
}