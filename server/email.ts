import nodemailer from 'nodemailer';

// ============================================
// CONFIGURAÇÃO DO GMAIL SMTP
// ============================================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.VITE_SMTP_USER,
    pass: process.env.VITE_SMTP_PASSWORD,
  },
});

// ============================================
// TEMPLATES DE EMAIL
// ============================================

export const emailContactTemplate = (name: string, email: string, message: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 5px 5px; }
          .field { margin: 15px 0; }
          .label { font-weight: bold; color: #2563eb; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📨 Novo Contato do Formulário</h1>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Nome:</span><br>
              ${name}
            </div>
            <div class="field">
              <span class="label">Email:</span><br>
              ${email}
            </div>
            <div class="field">
              <span class="label">Mensagem:</span><br>
              ${message.replace(/\n/g, '<br>')}
            </div>
            <div class="footer">
              <p>Este email foi enviado automaticamente pelo formulário de contato do seu site.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const emailConfirmationTemplate = (name: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 5px 5px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Obrigado pelo seu contato!</h1>
          </div>
          <div class="content">
            <p>Oi ${name},</p>
            <p>Recebemos sua mensagem com sucesso! 🎉</p>
            <p>Nosso time analisará sua solicitação e entraremos em contato em breve.</p>
            <p>Enquanto isso, se tiver alguma dúvida urgente, pode nos chamar no WhatsApp.</p>
            <div class="footer">
              <p>
                Obrigado por entrar em contato!<br>
                <strong>Philippe Boechat</strong>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

// ============================================
// FUNÇÃO PARA ENVIAR EMAIL
// ============================================

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const mailOptions = {
      from: `Philippe Boechat <${process.env.VITE_SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw error;
  }
};

// ============================================
// VALIDAÇÕES
// ============================================

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateContactForm = (data: {
  name?: string;
  email?: string;
  message?: string;
}): { valid: boolean; error?: string } => {
  if (!data.name || data.name.trim().length === 0) {
    return { valid: false, error: 'Nome é obrigatório' };
  }

  if (!data.email || !validateEmail(data.email)) {
    return { valid: false, error: 'Email inválido' };
  }

  if (!data.message || data.message.trim().length === 0) {
    return { valid: false, error: 'Mensagem é obrigatória' };
  }

  return { valid: true };
};
