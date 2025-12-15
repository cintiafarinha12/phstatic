# 🚀 GUIA DE DEPLOY NO RENDER.COM

## ✅ Pré-requisitos

1. Conta no Render.com (https://render.com)
2. Repositório GitHub conectado
3. Variáveis de ambiente configuradas

---

## 📋 Passo a Passo

### 1. Conectar GitHub ao Render

1. Acesse https://render.com
2. Faça login ou crie conta
3. Vá em "Dashboard" → "New +" → "Static Site"
4. Clique em "Connect Repository"
5. Autorize o Render a acessar seu GitHub
6. Selecione o repositório `phstatic`

### 2. Configurar o Deploy

Na tela de novo serviço:

```
Name: phstatic (ou seu nome)
Root Directory: (deixar em branco)
Build Command: npm install --legacy-peer-deps && npm run build
Publish Directory: dist
```

**IMPORTANTE:** O arquivo `render.yaml` já tem essas configurações!

### 3. Adicionar Variáveis de Ambiente

Após criar o serviço, vá em:
**Settings → Environment Variables**

Adicione TODAS essas variáveis (copie de `.env.local`):

```
VITE_ADMIN_PASSWORD_HASH = seu_hash_aqui
VITE_GOOGLE_ANALYTICS_ID = G_seu_id
VITE_GEMINI_API_KEY = sua_chave
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = sua_chave_anon
VITE_FORMSPREE_ID = f_seu_id
VITE_WHATSAPP_NUMBER = 55seu_numero
```

### 4. Fazer o Deploy

**Primeira vez:**
1. Clique em "Deploy"
2. Aguarde o build completar (≈ 2-3 min)
3. Seu site estará em: `https://phstatic.onrender.com` (ou similar)

**Próximas vezes:**
- Automático a cada push na `main`
- Ou manual em "Manual Deploy"

---

## 🔍 Verificar Status

1. Vá em Dashboard
2. Selecione seu serviço `phstatic`
3. Veja a aba "Deploys" para histórico
4. Logs em "Logs"

---

## ⚠️ Troubleshooting

### Build falhando?

**Error: "vite not found"**
- Solução: Build command já está correto em `render.yaml`
- Se não funcionar, tente:
```
npm install --legacy-peer-deps && npm run build
```

**Error: "Cannot find module @google/genai"**
- Solução: `package.json` já foi atualizado para `@google/generative-ai`
- Reimporte o projeto ou limpe cache do Render

### Variáveis não funcionando?

- Verificar se o nome está correto (case-sensitive!)
- Variáveis devem começar com `VITE_` para serem lidas
- Após adicionar, clique "Save" e aguarde redeploy

### Site carregando lento?

- Chunk muito grande? Render avisa no build
- Normal para plano free
- Upgrade para plano pago se necessário

---

## 🔐 Segurança

✅ **Bem feito:**
- `.env.local` NÃO está no GitHub
- Variáveis sensíveis no Render (não no código)
- Hash de admin protegido

❌ **Risco:**
- NUNCA fazer commit de `.env.local`
- Se vazar, regenere as chaves

---

## 📊 Planos Render

| Plano | Preço | Bom Para |
|-------|-------|----------|
| **Free** | R$ 0 | Desenvolvimento |
| **Paid** | ~R$ 50/mês | Produção |

Free é ótimo para começar!

---

## 🎯 Seu Site Está Online!

Após o deploy bem-sucedido:

✅ Site disponível 24/7
✅ Domínio Render + custom domain
✅ HTTPS automático
✅ Redeploy automático a cada push
✅ Logs e monitoring

**URL:** https://phstatic.onrender.com

Para adicionar domínio próprio:
- Settings → Domains → Add Custom Domain
- Configure DNS no seu registrador

---

## 📞 Suporte

- Render Docs: https://render.com/docs
- GitHub Repo: https://github.com/cintiafarinha12/phstatic

