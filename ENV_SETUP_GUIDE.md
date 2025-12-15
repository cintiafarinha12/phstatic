# 🔑 GUIA DE VARIÁVEIS DE AMBIENTE

## ✅ O que você tem agora

### Arquivos de Configuração:
- ✅ **`.env.local`** ← Suas chaves sensíveis (NÃO fazer commit)
- ✅ **`.env.example`** ← Template público (PODE fazer commit)
- ✅ **`.gitignore`** ← Já protege `.env.local`

---

## 🚀 Como Usar

### 1️⃣ Preencher `.env.local`

Abra o arquivo `.env.local` e preencha com suas chaves:

```env
VITE_ADMIN_PASSWORD_HASH=seu_hash_sha256
VITE_GOOGLE_ANALYTICS_ID=G_seu_id
VITE_GEMINI_API_KEY=sua_chave_gemini
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
VITE_FORMSPREE_ID=f_seu_id
VITE_WHATSAPP_NUMBER=55seu_numero
```

### 2️⃣ Gerar Hash de Senha Admin

1. Abra: https://www.online-convert.com/hash-generator
2. Escolha **SHA-256**
3. Digite sua senha (ex: `SenhaForte123!@`)
4. Copie o hash e cole em `VITE_ADMIN_PASSWORD_HASH`

### 3️⃣ Obter Chaves de Serviços

**Google Analytics:**
- https://analytics.google.com
- Settings → Data Streams → Web → Copy ID (formato: G_XXXXXXXXXX)

**Gemini API:**
- https://ai.google.dev/
- Clique em "Get API Key"
- Copie em `VITE_GEMINI_API_KEY`

**Supabase:**
- https://supabase.com → Seu projeto
- Settings → API → Copie URL e anon key

**Formspree:**
- https://formspree.io/
- Create new form
- Copy o ID (formato: f_xxxxx)

---

## ⚠️ SEGURANÇA - Importante!

### ✅ SIM, faça isso:
```bash
# No git
git add .env.example
git commit -m "Add env template"

# NO git (automático)
git ignore .env.local *.local
```

### ❌ NÃO faça isso:
```bash
# NÃO!
git add .env.local
git push

# NÃO!
Colocar chaves no código
Compartilhar .env.local
```

### 🔄 Se a chave vazar:

1. **Google Analytics**: Sem risco crítico
2. **Formspree**: Criar novo form
3. **GEMINI_API_KEY**: Regenerar em https://ai.google.dev
4. **SUPABASE_ANON_KEY**: Regenerar em Settings → API
5. **ADMIN_PASSWORD**: Mudar a senha, gerar novo hash

---

## 📊 Estrutura Final

```
seu-projeto/
├── .env.local          ← Suas chaves (NUNCA commit!)
├── .env.example        ← Template público (PODE commit)
├── .gitignore          ← Protege .env.local
├── vite.config.ts      ← Lê de import.meta.env
├── components/
│   ├── AdminPanel.tsx  ← Usa VITE_ADMIN_PASSWORD_HASH
│   └── Contact.tsx     ← Usa VITE_FORMSPREE_ID
└── lib/
    ├── api.ts          ← Usa VITE_SUPABASE_*
    └── supabaseClient.ts ← Usa VITE_SUPABASE_*
```

---

## 🧪 Testar Variáveis

No browser console ou arquivo:
```javascript
console.log(import.meta.env.VITE_ADMIN_PASSWORD_HASH); // Deve retornar o hash
console.log(import.meta.env.VITE_GEMINI_API_KEY);      // Deve retornar a chave
```

---

## ❌ Troubleshooting

**"Variável não está sendo lida"**
- Reinicie o servidor Vite: `npm run dev`
- Variáveis Vite devem começar com `VITE_`

**"Erro: Cannot find API key"**
- Verifique se `.env.local` está na raiz do projeto
- Não pode ter espaços antes/depois do `=`

**"Submeti a chave sem querer"**
- Se já fez push: regenere a chave no serviço
- Faça novo commit removendo a chave
- Use `git filter-branch` para remover do histórico

---

## 📝 Checklist de Segurança

- [ ] `.env.local` criado com suas chaves
- [ ] `.env.local` no `.gitignore` (automático)
- [ ] Testei uma variável no console
- [ ] Nunca comitei `.env.local`
- [ ] `.env.example` está publicamente seguro
- [ ] Servidor rodando com `npm run dev` (não `build`)

