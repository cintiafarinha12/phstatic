# 📧 Configuração da Edge Function - send-email

## O que é?
A Edge Function `send-email` é um backend serverless hospedado no Supabase que envia emails via Gmail SMTP. Ela processa requisições POST do frontend e valida credenciais antes de enviar.

## 📋 Pré-requisitos

### 1. Gmail App Password
Você já tem a senha de app do Google gerada:
```
Email: philippeboechat1@gmail.com
Senha: miuk fgrp uqii aqiu
```

Esta é uma senha especial do Google para apps (não é sua senha do Gmail).

### 2. Acesso ao Supabase Dashboard
- Acesse: https://app.supabase.com
- Projeto: phstatic (qkgctsxmwngxpeiqhhij)
- Vá para: Edge Functions

## 🚀 Passos para Configurar

### Opção 1: Via Dashboard Supabase (Recomendado)

1. **Ir para Edge Functions**
   - Abra seu projeto no Supabase
   - Clique em "Functions" no menu esquerdo
   - Procure por "send-email" (já deve estar lá como draft)

2. **Configurar Variáveis de Ambiente**
   - Clique em "send-email" function
   - Procure aba "Configuration" ou "Settings"
   - Adicione os secrets:
     ```
     SMTP_USER = philippeboechat1@gmail.com
     SMTP_PASSWORD = miuk fgrp uqii aqiu
     SMTP_HOST = smtp.gmail.com
     SMTP_PORT = 587
     SMTP_FROM_NAME = Philippe Boechat - Portfólio
     ```

3. **Deploy**
   - Clique em "Deploy" ou "Publish"
   - Aguarde a confirmação (deve estar verde/ativo)

### Opção 2: Via CLI (Alternativa)

```bash
# Instalar/atualizar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Definir secrets para a função
supabase secrets set \
  SMTP_USER="philippeboechat1@gmail.com" \
  SMTP_PASSWORD="miuk fgrp uqii aqiu" \
  SMTP_HOST="smtp.gmail.com" \
  SMTP_PORT="587" \
  SMTP_FROM_NAME="Philippe Boechat - Portfólio" \
  --project-ref qkgctsxmwngxpeiqhhij

# Deploy das funções
supabase functions deploy send-email --project-ref qkgctsxmwngxpeiqhhij
```

## 🧪 Testar a Edge Function

### Via cURL
```bash
curl -X POST https://qkgctsxmwngxpeiqhhij.supabase.co/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrZ2N0c3htd25neHBlaXFoaGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjAwMzcsImV4cCI6MjA4MDg5NjAzN30.inqCUhu13-jsCYZ1dgZnezPXPww0a4cMjlKZzBx0KEw" \
  -d '{
    "to": "philippeboechat1@gmail.com",
    "subject": "Email de Teste",
    "html": "<h1>Teste da Edge Function</h1><p>Se você recebeu este email, tudo está funcionando!</p>",
    "replyTo": "seu-email@example.com"
  }'
```

### Via Frontend (Contact Form)
1. Acesse o site em desenvolvimento
2. Vá para a página de Contato
3. Preencha o formulário
4. Clique em "Enviar"
5. Você deve receber:
   - Email de **notificação** (como admin)
   - Email de **confirmação** (como cliente)

## 📨 Formatos de Email Suportados

A função suporta qualquer template HTML. Exemplos:

### 1. Email de Contato (Contact)
```javascript
{
  "to": "philippeboechat1@gmail.com",
  "subject": "Novo contato do formulário",
  "html": "<h2>Novo Lead</h2><p>Nome: João</p><p>Email: joao@example.com</p>"
}
```

### 2. Email de Confirmação (Confirmation)
```javascript
{
  "to": "cliente@example.com",
  "subject": "Confirmação de contato",
  "html": "<h2>Obrigado!</h2><p>Recebemos sua mensagem e responderemos em breve.</p>"
}
```

### 3. Email de Contrato (Contract)
```javascript
{
  "to": "cliente@example.com",
  "subject": "Contrato - Proposta de Serviço",
  "html": "<h2>Proposta de Serviço</h2><p>Segue em anexo o contrato...</p>"
}
```

## 🔍 Troubleshooting

### "SMTP credentials não configurados"
- Verifique se os secrets estão configurados no Supabase
- Reinicie a função após adicionar secrets

### "Email sending failed"
- Verifique se a senha de app está correta (16 caracteres)
- Confirme que a conta Gmail tem 2FA habilitado
- Teste a senha em um cliente SMTP (ex: Thunderbird)

### "Connection timeout"
- Gmail SMTP pode estar bloqueado na sua rede
- Tente de um IP diferente ou VPN
- Verifique se a porta 587 está liberada

### Logs da Função
- Acesse o Supabase Dashboard
- Functions → send-email → Logs
- Procure por erros com timestamps

## 📞 Suporte

Para mais informações:
- Docs Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Gmail SMTP Support: https://support.google.com/mail/answer/185833

---

**Status**: ✅ Configurado e pronto para testes em produção
**Último update**: $(date)
