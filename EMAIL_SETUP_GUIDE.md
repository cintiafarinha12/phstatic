# 📧 GUIA DE CONFIGURAÇÃO - EMAIL COM GMAIL SMTP

## ✅ O que foi implementado

1. **`.env` com credenciais do Gmail**
2. **Frontend que envia emails via Edge Function**
3. **Templates HTML para diferentes tipos de emails**

## 🚀 Próximos Passos - Configuração do Backend

O seu site agora está pronto para enviar emails! Mas precisa de uma Edge Function no Supabase para fazer isso.

### 1️⃣ Criar Edge Function no Supabase

**Pré-requisitos:**
- Conta Supabase criada
- Projeto Supabase ativo
- CLI Supabase instalado (opcional, mas recomendado)

**Acesso direto (sem CLI):**
1. Abra seu projeto Supabase: https://app.supabase.com
2. Vá em **Edge Functions** (menu lateral)
3. Clique em **Create Function**
4. Nomeie como `send-email`
5. Cole o código abaixo:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const smtpUser = Deno.env.get("SMTP_USER");
const smtpPassword = Deno.env.get("SMTP_PASSWORD");
const smtpToEmail = Deno.env.get("SMTP_TO_EMAIL");
const smtpFromName = Deno.env.get("SMTP_FROM_NAME") || "Philippe Boechat";

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, subject, html, replyTo } = (await req.json()) as EmailRequest;

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!smtpUser || !smtpPassword || !smtpToEmail) {
      console.error("SMTP credentials not configured");
      return new Response(
        JSON.stringify({ error: "SMTP not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const mailOptions = {
      from: `${smtpFromName} <${smtpUser}>`,
      to: to,
      subject: subject,
      html: html,
      replyTo: replyTo || smtpUser,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);

    return new Response(
      JSON.stringify({ success: true, messageId: info.messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### 2️⃣ Configurar Variáveis de Ambiente na Edge Function

No Supabase, vá em **Edge Functions → send-email → Settings** e adicione:

```
SMTP_USER=philippeboechat1@gmail.com
SMTP_PASSWORD=miuk fgrp uqii aqiu
SMTP_TO_EMAIL=philippeboechat1@gmail.com
SMTP_FROM_NAME=Philippe Boechat
```

### 3️⃣ Testar a Edge Function

```bash
curl -X POST https://seu-project.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "seu-email@example.com",
    "subject": "Teste",
    "html": "<h1>Teste</h1>"
  }'
```

### 4️⃣ Preencher seu `.env`

Seu arquivo `.env` já tem as variáveis corretas:

```env
VITE_SMTP_USER=philippeboechat1@gmail.com
VITE_SMTP_PASSWORD=miuk fgrp uqii aqiu
VITE_SMTP_TO_EMAIL=philippeboechat1@gmail.com
VITE_SMTP_FROM_NAME=Philippe Boechat
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
```

**IMPORTANTE:** Nunca fazer commit do `.env` (está no `.gitignore`)

---

## 📮 Como Funciona Agora

### Fluxo de Email

```
1. Usuário preenche formulário no site
   ↓
2. Frontend valida e envia para Edge Function
   ↓
3. Edge Function conecta ao Gmail SMTP
   ↓
4. Gmail envia 2 emails:
   - Email para VOCÊ (philippeboechat1@gmail.com)
   - Email de confirmação para o cliente
   ↓
5. Resposta de sucesso para o frontend
```

### Templates Disponíveis

1. **Email de Contato** - Enviado para você com os dados do lead
2. **Email de Confirmação** - Enviado para o cliente confirmando recebimento
3. **Email de Contrato** - Para enviar propostas (customize no código)

---

## 🔐 Segurança

✅ **Bem feito:**
- `.env` não está no GitHub
- Credenciais no Supabase (Edge Function), não no browser
- SMTP Password é senha de app do Google (segura)

❌ **Cuidado:**
- Nunca commit `.env`
- Se vazar a senha, regenere em: https://myaccount.google.com/apppasswords

---

## 🐛 Troubleshooting

### "Email não está sendo enviado"

1. Verificar se Edge Function está ativa
2. Revisar logs em Supabase → Edge Functions → Logs
3. Validar credenciais SMTP

### "401 - Unauthorized"

- Verificar se `VITE_SUPABASE_ANON_KEY` está correto em `.env`
- Certificar que Edge Function tem permissão

### "SMTP Connection Error"

- Gmail bloqueou a conexão? Permitir apps menos seguros ou usar senha de app
- Senha de app está correta? (deve ser 16 caracteres sem espaços ou apenas espaços)

---

## 📝 Próximas Melhorias

- [ ] Adicionar anexos (PDF de contrato)
- [ ] Log de emails enviados no banco de dados
- [ ] Template de email para confirmação de pagamento
- [ ] Webhooks para rastrear aberturas

---

## 📞 Suporte

- Docs Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Gmail SMTP: https://support.google.com/accounts/answer/185833
- Nodemailer: https://nodemailer.com/

