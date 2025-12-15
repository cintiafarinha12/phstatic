/**
 * Funções para enviar emails via backend Node.js
 */

const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const sendContactEmail = async (data: {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
}) => {
  const response = await fetch(`${getApiUrl()}/api/send-contact-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao enviar email');
  }

  return response.json();
};

export const sendUpdateEmail = async (data: {
  clientEmail: string;
  clientName: string;
  projectName: string;
  message: string;
}) => {
  const response = await fetch(`${getApiUrl()}/api/send-update-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao enviar email');
  }

  return response.json();
};

export const sendContractEmail = async (data: {
  clientName: string;
  clientEmail: string;
  projectName: string;
  value: string;
  timeline: string;
  contractLink?: string;
}) => {
  const response = await fetch(`${getApiUrl()}/api/send-contract-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao enviar email');
  }

  return response.json();
};

export const sendGenericEmail = async (data: {
  to: string;
  subject: string;
  html: string;
}) => {
  const response = await fetch(`${getApiUrl()}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao enviar email');
  }

  return response.json();
};
