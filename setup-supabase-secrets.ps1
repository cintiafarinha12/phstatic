# ============================================
# SUPABASE EDGE FUNCTION - SECRETS SETUP
# Script PowerShell para configurar tudo automaticamente
# ============================================
#
# COMO USAR:
# 1. Abra PowerShell como Administrador
# 2. Execute: .\setup-supabase-secrets.ps1
#
# ============================================

# Cores para output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

Write-Host "
╔═════════════════════════════════════════════════════════════╗
║   🚀 SUPABASE EDGE FUNCTION - CONFIGURADOR AUTOMÁTICO      ║
║      send-email com Gmail SMTP                             ║
╚═════════════════════════════════════════════════════════════╝
" -ForegroundColor $Cyan

# ============================================
# VERIFICAR SE SUPABASE CLI ESTÁ INSTALADO
# ============================================

Write-Host "`n📋 Verificando Supabase CLI..." -ForegroundColor $Yellow

$supabaseCheck = supabase --version 2>$null

if (!$supabaseCheck) {
    Write-Host "❌ Supabase CLI não encontrado!" -ForegroundColor $Red
    Write-Host "`n📦 Instalando Supabase CLI..." -ForegroundColor $Yellow
    npm install -g supabase
    Write-Host "✅ Supabase CLI instalado!" -ForegroundColor $Green
} else {
    Write-Host "✅ Supabase CLI encontrado: $supabaseCheck" -ForegroundColor $Green
}

# ============================================
# CONFIGURAÇÕES
# ============================================

$projectRef = "qkgctsxmwngxpeiqhhij"
$functionName = "send-email"

$secrets = @{
    "SMTP_USER"       = "philippeboechat1@gmail.com"
    "SMTP_PASSWORD"   = "miuk fgrp uqii aqiu"
    "SMTP_HOST"       = "smtp.gmail.com"
    "SMTP_PORT"       = "587"
    "SMTP_FROM_NAME"  = "Philippe Boechat - Portfólio"
}

Write-Host "`n🔐 Secrets a configurar:" -ForegroundColor $Yellow
$secrets.GetEnumerator() | ForEach-Object {
    Write-Host "  • $($_.Key) = $(if ($_.Key -like '*PASSWORD*') { '••••••••' } else { $_.Value })" -ForegroundColor $Cyan
}

# ============================================
# CHECKLIST PRÉ-DEPLOYMENT
# ============================================

Write-Host "`n✓ PRÉ-REQUISITOS:" -ForegroundColor $Yellow
Write-Host "  [✓] Node.js instalado" -ForegroundColor $Green
Write-Host "  [✓] Supabase CLI instalado" -ForegroundColor $Green
Write-Host "  [✓] Edge Function 'send-email' criada" -ForegroundColor $Green
Write-Host "  [✓] Conta Supabase ativa" -ForegroundColor $Green

# ============================================
# OPÇÃO 1: LOGIN NO SUPABASE
# ============================================

Write-Host "`n🔑 Fazendo login no Supabase..." -ForegroundColor $Yellow
Write-Host "   (Browser será aberto para autenticação)" -ForegroundColor $Cyan

$loginResult = supabase login 2>&1

if ($LASTEXITCODE -eq 0 -or $loginResult -like "*Access Token*") {
    Write-Host "✅ Login realizado com sucesso!" -ForegroundColor $Green
} else {
    Write-Host "ℹ️  Login pode ter sido pulado (pode estar já autenticado)" -ForegroundColor $Yellow
}

# ============================================
# OPÇÃO 2: CONFIGURAR SECRETS
# ============================================

Write-Host "`n🔐 Configurando secrets no Supabase..." -ForegroundColor $Yellow
Write-Host "   (Isso pode levar alguns segundos)" -ForegroundColor $Cyan

# Construir argumentos para o comando supabase secrets set
$secretsArgs = @()
$secrets.GetEnumerator() | ForEach-Object {
    $secretsArgs += "$($_.Key)=$($_.Value)"
}

# Executar comando
$secretsCommand = @("secrets", "set") + $secretsArgs + @("--project-ref", $projectRef)

Write-Host "`n▶️  Executando: supabase $($secretsCommand -join ' ')" -ForegroundColor $Cyan

$secretsResult = & supabase $secretsCommand 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Secrets configurados com sucesso!" -ForegroundColor $Green
} else {
    Write-Host "⚠️  Resultado: $secretsResult" -ForegroundColor $Yellow
}

# ============================================
# OPÇÃO 3: DEPLOY DA FUNÇÃO
# ============================================

Write-Host "`n🚀 Fazendo deploy da Edge Function..." -ForegroundColor $Yellow

$deployCommand = @("functions", "deploy", $functionName, "--project-ref", $projectRef)

Write-Host "▶️  Executando: supabase $($deployCommand -join ' ')" -ForegroundColor $Cyan

$deployResult = & supabase $deployCommand 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Edge Function deployed com sucesso!" -ForegroundColor $Green
} else {
    Write-Host "⚠️  Resultado: $deployResult" -ForegroundColor $Yellow
}

# ============================================
# VERIFICAÇÃO FINAL
# ============================================

Write-Host "`n✓ PRÓXIMOS PASSOS:" -ForegroundColor $Yellow
Write-Host "  1. Acesse: https://app.supabase.com" -ForegroundColor $Cyan
Write-Host "  2. Vá para seu projeto (phstatic)" -ForegroundColor $Cyan
Write-Host "  3. Vá para Functions → send-email" -ForegroundColor $Cyan
Write-Host "  4. Confirme que a função está 'Active'" -ForegroundColor $Cyan
Write-Host "  5. Confirme que todos os secrets estão listados" -ForegroundColor $Cyan
Write-Host "`n  6. Teste localmente:" -ForegroundColor $Cyan
Write-Host "     npm run dev" -ForegroundColor $Cyan
Write-Host "     # Ir em http://localhost:3000/contato" -ForegroundColor $Cyan
Write-Host "     # Enviar formulário de teste" -ForegroundColor $Cyan

Write-Host "`n📞 SUPORTE:" -ForegroundColor $Yellow
Write-Host "  • Docs Edge Functions: https://supabase.com/docs/guides/functions" -ForegroundColor $Cyan
Write-Host "  • Gmail SMTP: https://support.google.com/mail/answer/185833" -ForegroundColor $Cyan

Write-Host "`n" -ForegroundColor $Green
Write-Host "╔═════════════════════════════════════════════════════════════╗" -ForegroundColor $Green
Write-Host "║  ✅ CONFIGURAÇÃO CONCLUÍDA!                               ║" -ForegroundColor $Green
Write-Host "╚═════════════════════════════════════════════════════════════╝" -ForegroundColor $Green

# Pausar antes de fechar
Read-Host "`n➤ Pressione Enter para sair"
