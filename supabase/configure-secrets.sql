-- ============================================
-- SUPABASE EDGE FUNCTION - SECRETS SETUP
-- ============================================
-- Script SQL para configurar variáveis de ambiente
-- da Edge Function 'send-email' no Supabase
--
-- ⚠️ COMO USAR:
-- 1. Acesse: https://app.supabase.com/project/qkgctsxmwngxpeiqhhij/sql/new
-- 2. Cole este script
-- 3. Execute (Cmd+Enter ou botão "Run")
-- ============================================

-- ============================================
-- ⚠️ IMPORTANTE: Esta solução é para PostgreSQL
-- ============================================
-- Infelizmente, secrets da Edge Function NÃO podem
-- ser configurados via SQL. Você PRECISA fazer manualmente
-- no Supabase Dashboard ou via CLI.
--
-- RAZÃO: Secrets são variáveis de ambiente do servidor
-- de Edge Functions (Deno), não dados do PostgreSQL.
-- ============================================

-- ============================================
-- SOLUÇÃO 1: Via Supabase Dashboard (Recomendado)
-- ============================================
-- 1. Acesse: https://app.supabase.com
-- 2. Seu projeto → Functions
-- 3. Procure por "send-email"
-- 4. Clique na função
-- 5. Vá para "Configuration" ou "Settings"
-- 6. Adicione estes secrets:

-- SMTP_USER = philippeboechat1@gmail.com
-- SMTP_PASSWORD = miuk fgrp uqii aqiu
-- SMTP_HOST = smtp.gmail.com
-- SMTP_PORT = 587
-- SMTP_FROM_NAME = Philippe Boechat - Portfólio

-- 7. Clique "Save" ou "Deploy"

-- ============================================
-- SOLUÇÃO 2: Via CLI (Alternativa)
-- ============================================
-- Execute no seu terminal (PowerShell):
--
-- npm install -g supabase
-- supabase login
-- supabase secrets set `
--   SMTP_USER="philippeboechat1@gmail.com" `
--   SMTP_PASSWORD="miuk fgrp uqii aqiu" `
--   SMTP_HOST="smtp.gmail.com" `
--   SMTP_PORT="587" `
--   SMTP_FROM_NAME="Philippe Boechat - Portfólio" `
--   --project-ref qkgctsxmwngxpeiqhhij
--
-- supabase functions deploy send-email --project-ref qkgctsxmwngxpeiqhhij

-- ============================================
-- Se quiser REGISTRAR os secrets em um banco de dados
-- (apenas para referência/logging), use isto:
-- ============================================

CREATE TABLE IF NOT EXISTS public.edge_function_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  config_key TEXT NOT NULL,
  config_value TEXT,
  is_secret BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(function_name, config_key)
);

-- Inserir configurações de referência (NÃO são os secrets reais)
INSERT INTO public.edge_function_config (function_name, config_key, config_value, is_secret)
VALUES
  ('send-email', 'SMTP_HOST', 'smtp.gmail.com', FALSE),
  ('send-email', 'SMTP_PORT', '587', FALSE),
  ('send-email', 'SMTP_FROM_NAME', 'Philippe Boechat - Portfólio', FALSE),
  ('send-email', 'SMTP_USER', '[CONFIGURE NO SUPABASE DASHBOARD]', TRUE),
  ('send-email', 'SMTP_PASSWORD', '[CONFIGURE NO SUPABASE DASHBOARD]', TRUE)
ON CONFLICT (function_name, config_key) DO UPDATE SET
  updated_at = NOW();

-- Ver configurações
SELECT * FROM public.edge_function_config WHERE function_name = 'send-email';

-- ============================================
-- VERIFICAR SE EDGE FUNCTION ESTÁ ATIVA
-- ============================================
-- Você pode verificar o status da função via API:
-- (Use em um cliente HTTP como Postman ou Terminal)

-- curl https://qkgctsxmwngxpeiqhhij.supabase.co/functions/v1/send-email \
--   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

-- ============================================
-- PERMISSÕES NECESSÁRIAS
-- ============================================
-- Seu usuário Supabase precisa ter permissão para:
-- ✓ Gerenciar Edge Functions
-- ✓ Configurar Secrets
-- ✓ Deploy de funções
--
-- Verifique em: Project Settings → Database Roles

-- ============================================
-- DOCUMENTAÇÃO OFICIAL
-- ============================================
-- Edge Functions Secrets:
-- https://supabase.com/docs/guides/functions/secrets
--
-- Environment Variables:
-- https://supabase.com/docs/guides/functions/environment-variables
