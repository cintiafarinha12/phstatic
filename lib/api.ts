
import { supabase } from './supabaseClient';
import { ClientProject, ContactFormData, PaymentOrder, ProjectFile } from '../types';
import { generatePixCode } from './pix';

/**
 * API REAL - CONECTADA AO SUPABASE
 */
export const api = {
    
    auth: {
        login: async (email: string, password: string) => {
            // LOGIN 100% REAL
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw new Error("E-mail ou senha incorretos.");

            // Buscar role do perfil real
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            return { 
                role: profile?.role || 'client', 
                token: data.session.access_token,
                user: data.user,
                profile: profile
            };
        },

        register: async (data: any) => { 
            try {
                // Validar dados de entrada
                if (!data.email || !data.password || data.password.length < 8) {
                    throw new Error('Email e senha (mínimo 8 caracteres) são obrigatórios');
                }
                
                const { data: authData, error } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                    options: {
                        data: {
                            full_name: data.clientName || data.name,
                            role: data.role || 'client'
                        }
                    }
                });
                
                if (error) throw new Error(error.message);
                return { success: true, user: authData.user };
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Erro ao registrar';
                throw new Error(errorMsg);
            }
        },

        changePassword: async (email: string, currentPassword: string, newPassword: string) => {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            return { success: true, message: "Senha atualizada." };
        },

        updateProfile: async (userId: string, data: { name?: string, email?: string }) => {
             const { error } = await supabase
                .from('profiles')
                .update({ full_name: data.name })
                .eq('id', userId); 
             
             if (error) throw error;
             return { success: true };
        },

        logout: async () => {
            try {
                await supabase.auth.signOut();
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                throw new Error('Erro ao fazer logout. Tente novamente.');
            }
        }
    },

    project: {
        createAccess: async (projectId: string, accessData: any) => {
            // CRIAÇÃO DE ACESSO REAL VIA EDGE FUNCTION
            // Chamamos o backend para criar o usuário 'auth.users' sem deslogar o admin
            
            console.log("Criando usuário real no backend...");

            const { data: funcData, error: funcError } = await supabase.functions.invoke('create-user', {
                body: {
                    email: accessData.email,
                    password: accessData.tempPassword,
                    name: accessData.clientName // Passamos o nome para criar o perfil
                }
            });

            if (funcError) {
                console.error("Erro na Edge Function:", funcError);
                
                // Tratamento de erro amigável para falta de deploy
                if (funcError.message && (funcError.message.includes('Function not found') || funcError.message.includes('404'))) {
                    throw new Error("A função de segurança 'create-user' não foi encontrada no Supabase. Execute 'supabase functions deploy create-user' no terminal.");
                }
                
                throw new Error(`Erro ao criar usuário: ${funcError.message}`);
            }

            if (funcData.error) {
                // Se usuário já existe, não é um erro fatal, apenas transferimos o projeto
                if (!funcData.error.includes("already registered")) {
                    throw new Error(funcData.error);
                }
                console.log("Usuário já existe, vinculando projeto...");
            }

            // O ID do novo usuário (ou do existente, se tivéssemos lógica de busca, 
            // mas aqui assumimos que se criou, funcData.user.user.id é o novo ID)
            
            // Caso o usuário já exista, precisamos buscar o ID dele pela tabela profiles (já que não temos acesso direto ao auth.users aqui)
            let targetUserId = funcData?.user?.user?.id;

            if (!targetUserId) {
                const { data: existingProfile } = await supabase.from('profiles').select('id').eq('email', accessData.email).single();
                if (existingProfile) targetUserId = existingProfile.id;
            }

            if (!targetUserId) throw new Error("Não foi possível obter o ID do usuário para vincular o projeto.");

            // TRANSFERIR O PROJETO DO ADMIN PARA O NOVO USUÁRIO REAL
            const { error: updateError } = await supabase
                .from('projects')
                .update({
                    user_id: targetUserId, // O projeto agora pertence ao cliente
                    metadata: {
                        ...accessData.metadata, // Mantém outros metadados
                        formalized_at: new Date().toISOString()
                    }
                })
                .eq('id', projectId);

            if (updateError) throw updateError;

            return { success: true, message: "Usuário real criado e projeto vinculado." };
        },

        updateStatus: async (projectId: string, status: string) => {
            const { error } = await supabase
                .from('projects')
                .update({ status, updated_at: new Date() })
                .eq('id', projectId);
            
            if (error) throw error;
            return { success: true };
        },
        
        getAll: async () => {
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    profiles:user_id (full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                if (error.code === '42P01') return [];
                return []; 
            }

            return data.map((p: any) => ({
                id: p.id,
                // Agora pegamos sempre do profile real, pois o projeto foi transferido
                clientName: p.profiles?.full_name || p.metadata?.client_name || 'Cliente',
                email: p.profiles?.email || p.metadata?.client_email || '',
                projectName: p.name,
                status: p.status,
                progress: p.progress,
                nextMilestone: p.next_milestone,
                dueDate: p.due_date,
                lastUpdate: new Date(p.updated_at).toLocaleDateString('pt-BR'),
                previewUrl: p.preview_url,
                financial: p.financial_data || { total: 0, paid: 0, status: 'pending' },
                tasks: [], 
                files: [], 
                links: p.links || {},
                activity: [], 
                notifications: [], 
                contract: p.contract_data,
                paymentOrder: null
            }));
        },
        
        create: async (projectData: any) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            // Cria o projeto inicialmente vinculado ao Admin
            // Será transferido ao Cliente na "Formalização"
            const { data, error } = await supabase
                .from('projects')
                .insert({
                    user_id: user.id, 
                    name: projectData.projectName,
                    financial_data: { total: projectData.totalValue, paid: 0, status: 'pending' },
                    status: 'new',
                    progress: 0,
                    metadata: {
                        client_name: projectData.clientName,
                        client_email: projectData.email
                    }
                })
                .select()
                .single();

            if (error) throw error;
            return { 
                ...data, 
                clientName: projectData.clientName, 
                email: projectData.email,
                financial: data.financial_data
            };
        },
        
        update: async (id: string, updates: any) => {
            const dbUpdates: any = {};
            if (updates.status) dbUpdates.status = updates.status;
            if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
            if (updates.financial) dbUpdates.financial_data = updates.financial;
            if (updates.contract) dbUpdates.contract_data = updates.contract;
            if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
            if (updates.nextMilestone) dbUpdates.next_milestone = updates.nextMilestone;
            if (updates.previewUrl !== undefined) dbUpdates.preview_url = updates.previewUrl;

            const { error } = await supabase.from('projects').update(dbUpdates).eq('id', id);
            if (error) throw error;
        }
    },

    // NOTE: Email sending is now handled via lib/api-email.ts which calls the Node.js backend
    // Routes: /api/send-contact-email, /api/send-update-email, /api/send-contract-email, /api/send-email

    contact: {
        submit: async (data: ContactFormData) => { 
            const { error } = await supabase.from('leads').insert({
                name: data.name,
                email: data.email,
                project_type: data.projectType,
                budget: data.budget,
                message: data.message
            });
            if (error) throw error;
            return { success: true }; 
        }
    },

    payment: {
        create: async (amount: number, description: string, payerEmail: string): Promise<PaymentOrder> => {
            const txId = `PH${Math.floor(Math.random() * 10000)}`.toUpperCase();
            const fallbackKey = "05379507107"; 
            const pixCode = generatePixCode(fallbackKey, "PH Development", "BRASILIA", amount, txId);
            return {
                id: txId,
                description,
                amount,
                status: 'pending',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                pixCode: pixCode
            };
        },
        checkStatus: async (paymentId: string): Promise<{status: string}> => {
            return { status: 'pending' };
        }
    }
};
