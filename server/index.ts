import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  sendEmail,
  emailContactTemplate,
  emailConfirmationTemplate,
  validateContactForm,
} from './email.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());

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
    const { name, email, message } = req.body;

    // Validar dados
    const validation = validateContactForm({ name, email, message });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Enviar email para admin
    const adminEmail = process.env.VITE_SMTP_USER || 'philippeboechat1@gmail.com';
    await sendEmail(
      adminEmail,
      `Novo contato de ${name}`,
      emailContactTemplate(name, email, message)
    );

    // Enviar confirmação para cliente
    await sendEmail(
      email,
      'Confirmação de contato',
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
