# 🚀 BACKEND SIMPLES - Email via Node.js

## ✅ O Que Mudou

Removemos a complexidade do Supabase Edge Functions!

Agora temos um **servidor Node.js simples** que:
- ✅ Roda localmente (`http://localhost:3001`)
- ✅ Envia emails via Gmail SMTP
- ✅ Sem configuração complicada
- ✅ Fácil de debugar

---

## 📁 Estrutura

```
server/
├─ index.ts       ← Servidor Express
├─ email.ts       ← Funções de email
└─ ... (você roda isso)
```

---

## 🚀 Como Usar

### 1. Instalar Dependências Novas

```bash
npm install
```

Isto vai instalar:
- `express` - framework web
- `nodemailer` - envio de emails
- `cors` - permitir requisições do frontend
- `dotenv` - variáveis de ambiente

### 2. Rodando em Desenvolvimento

**Opção A - Rodar tudo junto (Recomendado):**
```bash
npm run dev:all
```

Isto abre:
- Frontend: http://localhost:3000 (Vite)
- Backend: http://localhost:3001 (Express)

**Opção B - Rodar separado:**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run dev:server
```

### 3. Testar

1. Vá para http://localhost:3000/contato
2. Preencha o formulário
3. Clique em "Enviar"
4. Você deve receber 2 emails em 1-2 minutos:
   - Um para você (admin)
   - Um para o cliente (confirmação)

---

## 🏭 Deploy em Produção (Render.com)

### Via Render

1. **Crie um novo "Web Service"**
   - Conecte seu GitHub
   - Build Command: `npm install --legacy-peer-deps && npm run build`
   - Start Command: `node server/index.ts` (ou `tsx server/index.ts`)
   - Port: `3001`

2. **Configure Environment Variables**
   ```
   VITE_SMTP_USER=philippeboechat1@gmail.com
   VITE_SMTP_PASSWORD=miuk fgrp uqii aqiu
   ```

3. **Clique Deploy**

4. **Atualize o frontend**
   - Em produção, mude a URL da API no `.env`:
   ```
   VITE_API_URL=https://seu-backend.onrender.com
   ```

---

## 🔑 Variáveis de Ambiente Necessárias

No `.env` (local) e no Render (produção):

```
# API
VITE_API_URL=http://localhost:3001 (local)
VITE_API_URL=https://seu-backend.onrender.com (produção)

# Gmail SMTP
VITE_SMTP_USER=philippeboechat1@gmail.com
VITE_SMTP_PASSWORD=miuk fgrp uqii aqiu
```

---

## 📧 Como Funciona

1. **Usuário preenche formulário** em `/contato`
2. **Frontend valida** (nome, email, mensagem)
3. **Frontend faz POST** para `http://localhost:3001/api/send-contact-email`
4. **Backend recebe** e valida novamente
5. **Backend se conecta** ao Gmail SMTP
6. **Backend envia 2 emails:**
   - Admin notification
   - Client confirmation
7. **Frontend recebe resposta** e mostra sucesso ✅

---

## 🆘 Troubleshooting

### Erro: "Cannot find module 'express'"
```bash
npm install
```

### Erro: "EADDRINUSE :::3001" (porta já em uso)
Outra aplicação está usando a porta 3001:
```bash
# Matar processo na porta 3001
lsof -i :3001
kill -9 <PID>
```

### Email não chega
1. Verifique credenciais no `.env`
2. Verifique pasta Spam
3. Confirme que a senha de app do Google está correta

### "Connect ECONNREFUSED" quando submeter formulário
O servidor Node não está rodando:
```bash
npm run dev:server
```

---

## ✨ Vantagens desta Solução

✅ **Mais simples** que Edge Functions
✅ **Mais controle** sobre o backend
✅ **Fácil debugar** (você vê os logs)
✅ **Funciona offline** para desenvolvimento
✅ **Escalável** (roda em qualquer servidor Node)
✅ **Sem vendor lock-in** (não depende do Supabase)

---

## 📝 Próximos Passos

1. [ ] Instalar dependências: `npm install`
2. [ ] Testar localmente: `npm run dev:all`
3. [ ] Enviar um email de teste
4. [ ] Deploy no Render.com
5. [ ] Testar em produção

---

**Tempo total: ~15 minutos** ⏱️

Muito mais simples que antes! 🚀
