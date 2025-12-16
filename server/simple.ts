import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import {
  emailContactTemplate,
  emailConfirmationTemplate,
} from '../lib/email.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 12345;

// Setup Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.VITE_SMTP_USER,
    pass: process.env.VITE_SMTP_PASSWORD,
  },
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Rota única: enviar email de contato
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, projectType, budget, message } = req.body;

    if (!name || !email || !projectType || !budget || !message) {
      return res.status(400).json({ error: 'Faltam campos obrigatórios' });
    }

    const adminEmail = process.env.VITE_SMTP_USER;

    // Email para admin
    await transporter.sendMail({
      from: process.env.VITE_SMTP_USER,
      to: adminEmail,
      subject: `Novo Lead: ${projectType} - ${name}`,
      html: emailContactTemplate({ name, email, projectType, budget, message })
    });

    // Email de confirmação para cliente
    await transporter.sendMail({
      from: process.env.VITE_SMTP_USER,
      to: email,
      subject: 'Recebemos seu formulário! ✅',
      html: emailConfirmationTemplate(name)
    });

    res.json({ success: true, message: 'Email enviado!' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao enviar email' });
  }
});

// Fallback SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server rodando em http://localhost:${PORT}`);
});
