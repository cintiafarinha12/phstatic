import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  sendEmail,
  emailContactTemplate,
  emailConfirmationTemplate,
  emailContractTemplate,
  emailUpdateTemplate,
} from './email.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do Vite
app.use(express.static(path.join(__dirname, '../dist')));

// ============================================
// ROTAS
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Enviar email de contato
app.post('/api/send-contact-email', async (req, res) => {
  try {
    const { name, email, projectType, budget, message } = req.body;

    // Validar dados
    if (!name || !email || !projectType || !budget || !message) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Enviar email para admin
    const adminEmail = process.env.VITE_SMTP_USER || 'philippeboechat1@gmail.com';
    await sendEmail(
      adminEmail,
      `🚀 Novo Lead: ${projectType} - ${name}`,
      emailContactTemplate({
        name,
        email,
        projectType,
        budget,
        message,
      })
    );

    // Enviar confirmação para cliente
    await sendEmail(
      email,
      'Recebemos seu formulário! ✅',
      emailConfirmationTemplate(name)
    );

    res.json({
      success: true,
      message: 'Email enviado com sucesso!',
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({
      error: 'Erro ao enviar email',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Enviar email de contrato
app.post('/api/send-contract-email', async (req, res) => {
  try {
    const { clientName, clientEmail, projectName, value, timeline, contractLink } = req.body;

    if (!clientName || !clientEmail || !projectName || !value || !timeline) {
      return res.status(400).json({ error: 'Dados obrigatórios faltando' });
    }

    await sendEmail(
      clientEmail,
      `📋 Proposta de Projeto - ${projectName}`,
      emailContractTemplate({
        clientName,
        projectName,
        value,
        timeline,
        contractLink,
      })
    );

    res.json({
      success: true,
      message: 'Email de contrato enviado!',
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({
      error: 'Erro ao enviar email',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Enviar email de atualização de projeto
app.post('/api/send-update-email', async (req, res) => {
  try {
    const { clientEmail, clientName, projectName, message } = req.body;

    if (!clientEmail || !clientName || !projectName || !message) {
      return res.status(400).json({ error: 'Dados obrigatórios faltando' });
    }

    await sendEmail(
      clientEmail,
      `📢 Atualização: ${projectName}`,
      emailUpdateTemplate({
        clientName,
        projectName,
        message,
      })
    );

    res.json({
      success: true,
      message: 'Email de atualização enviado!',
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({
      error: 'Erro ao enviar email',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Enviar email genérico
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Campos obrigatórios: to, subject, html' });
    }

    await sendEmail(to, subject, html);

    res.json({
      success: true,
      message: 'Email enviado!',
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({
      error: 'Erro ao enviar email',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Fallback para SPA - servir index.html para rotas desconhecidas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Email Server Rodando              ║
║  http://localhost:${PORT}             ║
║  Rota: POST /api/send-contact-email   ║
╚════════════════════════════════════════╝
  `);
});

export default app;
