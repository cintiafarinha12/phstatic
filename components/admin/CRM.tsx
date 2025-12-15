
import React, { useState } from 'react';
import { Plus, DollarSign, FileText, CheckCircle2, QrCode, Check, Edit, Mail, Search } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { Button } from '../Button';
import { CreateProjectModal } from '../admin/modals/CreateProjectModal';
import { EditProjectModal } from '../admin/modals/EditProjectModal';
import { EmailGeneratorModal } from '../EmailGeneratorModal';
import { ContractGeneratorModal } from '../ContractGeneratorModal';
import { api } from '../../lib/api';
import { sendUpdateEmail } from '../../lib/api-email';
import { ClientProject } from '../../types';

export const CRM: React.FC = () => {
  const { projects, updateProject, createProject, sendNotification } = useProject();
  
  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ClientProject | null>(null);
  const [emailModalProject, setEmailModalProject] = useState<ClientProject | null>(null);
  const [contractProject, setContractProject] = useState<ClientProject | null>(null);

  const STATUS_LABELS: Record<string, string> = {
    'new': 'Novo Lead',
    'briefing': 'Briefing',
    'development': 'Em Desenvolvimento',
    'review': 'Em Revisão',
    'completed': 'Concluído'
  };

  // --- ACTIONS HANDLERS ---

  const handleCreateProject = (data: { clientName: string; email: string; projectName: string; totalValue: number }) => {
      createProject(data);
      alert('Novo projeto criado com sucesso!');
  };

  const handleEditSave = async (id: string, data: Partial<ClientProject>, notify: boolean, emailMsg?: string) => {
      updateProject(id, data);
      if (notify && emailMsg && editingProject) {
          try {
              await sendUpdateEmail({
                  clientEmail: editingProject.email,
                  clientName: editingProject.clientName,
                  projectName: editingProject.projectName,
                  message: emailMsg,
              });
              alert("Projeto atualizado e notificação enviada!");
          } catch (error) {
              console.error('Erro ao enviar email:', error);
              alert("Projeto atualizado, mas houve erro ao enviar email");
          }
      }
  };

  const handleApprovePayment = async (project: ClientProject) => {
      if (!project.paymentOrder) return;
      
      const newPaid = project.financial.paid + project.paymentOrder.amount;
      const isTotal = newPaid >= project.financial.total;
      
      updateProject(project.id, {
          paymentOrder: null, 
          financial: {
              ...project.financial,
              paid: newPaid,
              status: isTotal ? 'paid' : 'partial'
          },
          lastUpdate: 'Pagamento Confirmado'
      });
      alert("Pagamento confirmado manualmente.");
  };

  const handleGeneratePayment = async (project: ClientProject, type: 'signal' | 'final') => {
      const amount = type === 'signal' ? (project.financial.total / 2) : (project.financial.total - project.financial.paid);
      const desc = type === 'signal' ? `Sinal de 50% - ${project.projectName}` : `Parcela Final - ${project.projectName}`;
      
      try {
          const order = await api.payment.create(amount, desc, project.email);
          updateProject(project.id, { paymentOrder: order });
          alert(`Cobrança de R$ ${amount} gerada!`);
      } catch (err: any) {
          alert("Erro ao gerar pagamento.");
      }
  };

  const handleContractUpdate = async (contractData: any) => {
      if (!contractProject) return;
      const updatedContract = { ...(contractProject.contract || {}), ...contractData };
      
      updateProject(contractProject.id, {
          contract: updatedContract,
          lastUpdate: 'Contrato Atualizado'
      });

      if (contractData.status === 'sent_to_client') {
          sendNotification(contractProject.id, {
              title: 'Contrato Disponível',
              message: 'O contrato de serviço foi gerado e aguarda sua assinatura no portal.',
              type: 'warning'
          });
          alert("Contrato enviado e cliente notificado!");
      }
  };

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Projetos</h2>
            <Button leftIcon={<Plus size={16}/>} size="sm" onClick={() => setIsCreateModalOpen(true)}>Novo Projeto</Button>
        </div>

        {/* MODALS */}
        {isCreateModalOpen && <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateProject} />}
        {editingProject && <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} onSave={handleEditSave} />}
        {emailModalProject && <EmailGeneratorModal project={emailModalProject} onClose={() => setEmailModalProject(null)} onSuccess={() => {}} />}
        {contractProject && <ContractGeneratorModal project={contractProject} onClose={() => setContractProject(null)} userRole="admin" onContractUpdate={handleContractUpdate} />}

        <div className="grid gap-6">
            {projects.map((project) => {
                const isContractSigned = project.contract?.status === 'signed';
                const isContractSent = project.contract?.status === 'sent_to_client';
                const isPaid = project.financial.status === 'paid';
                
                return (
                <div key={project.id} className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* Header do Card */}
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-xl">
                                {project.clientName.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{project.projectName}</h4>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    {project.clientName} • <span className="opacity-70">{project.email}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 ${
                                project.status === 'completed' ? 'bg-green-100 text-green-700' :
                                project.status === 'development' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {STATUS_LABELS[project.status] || project.status}
                            </span>
                            <p className="text-xs text-gray-400">Entrega: {project.dueDate}</p>
                        </div>
                    </div>

                    {/* Corpo do Card */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Coluna 1: Status Financeiro */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase">Financeiro</p>
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${isPaid ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.financial.paid)}
                                        <span className="text-gray-400 font-normal"> / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.financial.total)}</span>
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                        {isPaid ? 'Totalmente Quitado' : `Restante: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.financial.total - project.financial.paid)}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Coluna 2: Progresso */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase">Progresso</p>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-1">
                                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{project.progress}% Concluído</span>
                                <span>Próx: {project.nextMilestone}</span>
                            </div>
                        </div>

                        {/* Coluna 3: Ações Rápidas (Botões) */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase">Ações Rápidas</p>
                            <div className="grid grid-cols-2 gap-2">
                                
                                <button 
                                    onClick={() => setContractProject(project)}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                                        isContractSigned ? 'bg-green-50 border-green-200 text-green-700' : 
                                        isContractSent ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                        'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                                    }`}
                                >
                                    <FileText size={14} /> 
                                    {isContractSigned ? 'Ver Contrato' : isContractSent ? 'Aguard. Assinatura' : 'Gerar Contrato'}
                                </button>

                                {project.paymentOrder ? (
                                    <button 
                                        onClick={() => handleApprovePayment(project)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                                    >
                                        <CheckCircle2 size={14} /> Aprovar Pix
                                    </button>
                                ) : !isPaid ? (
                                    <button 
                                        onClick={() => handleGeneratePayment(project, project.financial.paid === 0 ? 'signal' : 'final')}
                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border bg-white border-gray-200 hover:bg-gray-50 text-gray-600"
                                    >
                                        <QrCode size={14} /> 
                                        {project.financial.paid === 0 ? 'Cobrar Sinal' : 'Cobrar Final'}
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border border-transparent text-green-600 bg-green-50/50 cursor-default">
                                        <Check size={14} /> Pago
                                    </div>
                                )}

                                {['new', 'briefing'].includes(project.status) && (
                                    <button 
                                        onClick={() => setEmailModalProject(project)}
                                        className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        <Mail size={14} /> Formalizar Início & Enviar Acesso
                                    </button>
                                )}

                                <button 
                                    onClick={() => setEditingProject(project)}
                                    className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 hover:border-primary-200 hover:text-primary-600 transition-colors"
                                >
                                    <Edit size={14} /> Editar Detalhes do Projeto
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            )})}
        </div>
    </div>
  );
};
