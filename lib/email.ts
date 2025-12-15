/**
 * Serviço de Email via Backend (Supabase Edge Function)
 * O backend usa nodemailer para conectar ao Gmail SMTP
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Enviar email via Edge Function do Supabase
 * IMPORTANTE: Você precisa criar uma Edge Function chamada "send-email" no Supabase
 */
export const sendEmail = async (options: EmailOptions) => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error('Supabase credentials não configurados');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao enviar email');
    }

    const data = await response.json();
    console.log('Email enviado:', data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

/**
 * Template: Email de Contato
 */
export const emailContactTemplate = (data: {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
}) => `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1>📧 Novo Lead do Portfólio</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; border-radius: 0 0 8px 8px;">
      <h2 style="color: #667eea;">Informações do Cliente</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; font-weight: bold; background: #f0f0f0; width: 30%;">Nome:</td>
          <td style="padding: 10px;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; background: #f0f0f0;">Email:</td>
          <td style="padding: 10px;">
            <a href="mailto:${data.email}" style="color: #667eea; text-decoration: none;">${data.email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; background: #f0f0f0;">Tipo de Projeto:</td>
          <td style="padding: 10px;">${data.projectType}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; background: #f0f0f0;">Orçamento:</td>
          <td style="padding: 10px;">${data.budget}</td>
        </tr>
      </table>

      <div style="margin-top: 20px; padding: 15px; background: #fff; border-left: 4px solid #667eea;">
        <h3 style="margin-top: 0; color: #333;">Mensagem:</h3>
        <p style="white-space: pre-wrap; line-height: 1.6;">${data.message}</p>
      </div>

      <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px; text-align: center;">
        <a href="mailto:${data.email}?subject=Re: Seu projeto de ${data.projectType}" 
           style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Responder Agora
        </a>
      </div>
    </div>

    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>Este email foi gerado automaticamente pelo formulário de contato</p>
      <p style="margin: 5px 0;">📍 De: ${data.email}</p>
    </div>
  </div>
`;

/**
 * Template: Email de Confirmação para Cliente
 */
export const emailConfirmationTemplate = (clientName: string) => `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1>✅ Obrigado pelo seu interesse!</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; border-radius: 0 0 8px 8px;">
      <p>Olá <strong>${clientName}</strong>,</p>

      <p>Recebemos seu formulário de contato com sucesso! 🎉</p>

      <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
        <p>Entraremos em contato em breve para discutir seu projeto. Você pode esperar um retorno em até <strong>24 horas</strong>.</p>
      </div>

      <h3>Próximos Passos:</h3>
      <ol style="line-height: 1.8;">
        <li>📧 Aguarde nosso email de confirmação</li>
        <li>💬 Agende uma chamada ou troque mensagens</li>
        <li>📋 Receba uma proposta personalizada</li>
        <li>🚀 Começamos o projeto!</li>
      </ol>

      <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 8px;">
        <p style="margin: 0; color: #666;">Dúvidas? Pode responder este email ou entrar em contato via WhatsApp.</p>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <p style="color: #667eea; font-weight: bold; margin: 0;">Atenciosamente,</p>
        <p style="margin: 5px 0;">Philippe Boechat</p>
        <p style="margin: 5px 0; font-size: 12px; color: #999;">Especialista em Frontend & Performance Web</p>
      </div>
    </div>
  </div>
`;

/**
 * Template: Email de Contrato/Formalização
 */
export const emailContractTemplate = (data: {
  clientName: string;
  projectName: string;
  value: string;
  timeline: string;
  contractLink?: string;
}) => `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1>📋 Proposta de Projeto</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; border-radius: 0 0 8px 8px;">
      <p>Olá <strong>${data.clientName}</strong>,</p>

      <p>Segue em anexo a proposta formal para seu projeto!</p>

      <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
        <h3 style="margin-top: 0; color: #28a745;">Resumo da Proposta</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; background: #f0f0f0;">Projeto:</td>
            <td style="padding: 8px;">${data.projectName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; background: #f0f0f0;">Valor:</td>
            <td style="padding: 8px;"><strong style="color: #28a745; font-size: 16px;">R$ ${data.value}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; background: #f0f0f0;">Timeline:</td>
            <td style="padding: 8px;">${data.timeline}</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 20px; text-align: center;">
        ${data.contractLink ? `
          <a href="${data.contractLink}" 
             style="display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Ver Contrato Completo
          </a>
        ` : `
          <p style="color: #999;">Contrato em anexo</p>
        `}
      </div>

      <h3>Próximas Etapas:</h3>
      <ol style="line-height: 1.8;">
        <li>✅ Revise a proposta</li>
        <li>📝 Assine o contrato</li>
        <li>💳 Realize o depósito da primeira parcela</li>
        <li>🚀 Iniciamos o desenvolvimento!</li>
      </ol>

      <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
        <p style="margin: 0; color: #856404;"><strong>⏰ Válido por 7 dias</strong> - Confirme sua aceitação em breve!</p>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <p style="color: #28a745; font-weight: bold; margin: 0;">Atenciosamente,</p>
        <p style="margin: 5px 0;">Philippe Boechat</p>
      </div>
    </div>
  </div>
`;
