# 🖱️ GUIA VISUAL - Onde Configurar Secrets no Supabase

## 📍 Passo 1: Ir para Functions

1. Abra: **https://app.supabase.com**
2. Clique no seu projeto: **phstatic**
3. No menu esquerdo, procure por **Functions** (ícone ⚙️)
4. Clique em **Functions**

```
├─ Project Settings
├─ Authentication
├─ Database
├─ SQL Editor
├─ API Documentation
├─ Vector
├─ Functions  👈 CLIQUE AQUI
```

---

## 📍 Passo 2: Procurar Edge Function

Você verá uma lista de funções. Procure por:

```
send-email
├─ Status: Draft (ou Deployed)
├─ Region: us-east-1
└─ Last Updated: [data]
```

Se não estiver na lista, clique em **"Deploy a new function"** ou **"+"**

---

## 📍 Passo 3: Abrir a Edge Function

Clique em **send-email** para abrir os detalhes.

Você verá abas como:
- **Code** - O código TypeScript
- **Configuration** - Variáveis de ambiente ⭐
- **Logs** - Histórico de execução
- **Details** - Informações gerais

---

## 📍 Passo 4: Ir para Configuration (Secrets)

Clique na aba **Configuration** (ou **Settings**)

Procure por uma seção chamada:
- "Environment Variables"
- "Secrets"
- "Configuration"

---

## 📍 Passo 5: Adicionar Secrets

Você verá um botão como:
- **"Add Secret"**
- **"Add Variable"**
- **"+"**

Clique nele e adicione cada secret:

### Secret 1: SMTP_USER
```
Name:  SMTP_USER
Value: philippeboechat1@gmail.com
[Save ou Add]
```

### Secret 2: SMTP_PASSWORD
```
Name:  SMTP_PASSWORD
Value: miuk fgrp uqii aqiu
[Save ou Add]
```

### Secret 3: SMTP_HOST
```
Name:  SMTP_HOST
Value: smtp.gmail.com
[Save ou Add]
```

### Secret 4: SMTP_PORT
```
Name:  SMTP_PORT
Value: 587
[Save ou Add]
```

### Secret 5: SMTP_FROM_NAME
```
Name:  SMTP_FROM_NAME
Value: Philippe Boechat - Portfólio
[Save ou Add]
```

---

## ✅ Passo 6: Deploy/Publish

Após adicionar os secrets, você deve ver:

```
✓ SMTP_USER = ••••••••••••••••••••• (hidden)
✓ SMTP_PASSWORD = •••••••••• (hidden)
✓ SMTP_HOST = smtp.gmail.com
✓ SMTP_PORT = 587
✓ SMTP_FROM_NAME = Philippe Boechat - Portfólio
```

Clique em:
- **"Deploy"** ou
- **"Publish"** ou
- **"Save"**

Aguarde mensagem: ✅ **Function deployed successfully**

---

## 📊 Status Final

A função deve ficar assim:

```
send-email
├─ Status: ✅ Deployed / Active (verde)
├─ Secrets: 5 configured
├─ Last Updated: agora
└─ URL: https://qkgctsxmwngxpeiqhhij.supabase.co/functions/v1/send-email
```

---

## 🔍 Se Não Conseguir Encontrar

### Cenário 1: Não aparece a aba "Configuration"
- Clique na função `send-email`
- Procure por abas no topo: **Code | Configuration | Logs | Details**
- Se não estiver lá, clique em **"..."** (três pontos) para mais opções

### Cenário 2: Não tem botão "Add Secret"
- Procure por um ícone de **"+"** ou **"Add"**
- Ou tente a CLI (veja abaixo)

### Cenário 3: Secrets estão "hidden" (com asteriscos)
- ✅ **Isso é normal!** Secrets são mascarados por segurança
- Quer confirmação? Teste a função (veja próxima seção)

---

## 🧪 Testar se Funcionou

### Opção 1: Testar pelo Frontend
1. Execute: `npm run dev`
2. Vá em: http://localhost:3000/contato
3. Preencha o formulário
4. Clique em "Enviar"
5. Cheque seu email: philippeboechat1@gmail.com

### Opção 2: Testar com cURL
```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrZ2N0c3htd25neHBlaXFoaGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjAwMzcsImV4cCI6MjA4MDg5NjAzN30.inqCUhu13-jsCYZ1dgZnezPXPww0a4cMjlKZzBx0KEw"

curl -X POST "https://qkgctsxmwngxpeiqhhij.supabase.co/functions/v1/send-email" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d @'{
    "to": "philippeboechat1@gmail.com",
    "subject": "Teste da Edge Function",
    "html": "<h1>Funcionou!</h1>",
    "replyTo": "seu-email@example.com"
  }'
```

### Opção 3: Ver Logs
1. Volte para a função `send-email`
2. Clique em aba **"Logs"**
3. Você verá:
   ```
   ✅ Email enviado com sucesso! ID: xyz123
   ou
   ❌ SMTP credentials não configurados
   ou
   ❌ Connection timeout
   ```

---

## 📞 Troubleshooting Visual

### Se vir: ❌ "SMTP credentials não configurados"
👉 **Verifique se adicionou TODOS os 5 secrets**

### Se vir: ❌ "Connection timeout"
👉 **Tente em outra rede (sair do WiFi corporativo/VPN)**

### Se vir: ✅ "Email enviado com sucesso"
👉 **Perfeito! Email deve chegar em 1-2 minutos**

### Se vir: ❌ "Invalid email address"
👉 **Verifique se o email do destinatário está correto**

---

## 🎯 Resumo Rápido

| Passo | O que fazer |
|-------|-------------|
| 1 | Abra app.supabase.com |
| 2 | Vá para Functions |
| 3 | Clique em send-email |
| 4 | Clique em Configuration |
| 5 | Clique em Add Secret (x5) |
| 6 | Salve e Deploy |
| 7 | Teste enviando email |

---

## ✨ Dica Profissional

Depois de configurar, você pode:

✅ Automatizar enviio de emails para contratos
✅ Enviar notificações de pedidos
✅ Enviar convites de formulário
✅ Enviar lembretes automáticos

Tudo sem depender de serviços externos (como Formspree)!

---

**Tempo total estimado: 10 minutos** ⏱️
