Inicio -> https://portaldev.pagbank.com.br/primeiros-passos
Tokens -> https://portaldev.pagbank.com.br/tokens
Cartões de teste -> https://developer.pagbank.com.br/docs/cartoes-de-teste
Pagamentos recorrente dash -> https://sandbox.assinaturas.pagseguro.uol.com.br/dashboard

Pagamentos recorrentes doc -> https://developer.pagbank.com.br/docs/painel-de-pagamentos-recorrentes

Pagamentos recorrentes doc api -> https://developer.pagbank.com.br/reference/consultar-chave-publica-pagamento-recorrente



# 1 Criar chave pública

- A chave publica será utilizado nas requisições aos endpoints de Pagamento Recorrente do PagBank

```
curl --request PUT \
     --url https://sandbox.api.assinaturas.pagseguro.com/public-keys \
     --header 'Authorization: Bearer <token>' \
     --header 'accept: application/json'
```