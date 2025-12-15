
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body = await req.json() as EmailRequest;

    // Validate required fields
    if (!body.to || !body.subject || !body.html) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to, subject, html",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get environment variables
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.gmail.com";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const fromName = Deno.env.get("SMTP_FROM_NAME") || "Philippe Boechat - Portfólio";

    // Validate SMTP configuration
    if (!smtpUser || !smtpPassword) {
      console.error("❌ SMTP credentials não configurados");
      return new Response(
        JSON.stringify({
          error: "Email service não configurado corretamente",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create SMTP client
    const client = new SmtpClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPassword,
        },
      },
    });

    // Connect and send email
    await client.connect();

    const messageId = await client.send({
      from: `${fromName} <${smtpUser}>`,
      to: body.to,
      subject: body.subject,
      html: body.html,
      replyTo: body.replyTo || smtpUser,
      headers: new Map([
        ["X-Mailer", "Supabase Edge Function"],
      ]),
    });

    await client.close();

    console.log(`✅ Email enviado com sucesso! ID: ${messageId}`);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: messageId,
        to: body.to,
        subject: body.subject,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro ao enviar email",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});