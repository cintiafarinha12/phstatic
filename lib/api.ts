import { supabase } from './supabaseClient';
import { ClientProject, ProjectFile } from '../types';

/**
 * API - SUPABASE APENAS PARA AUTENTICAÇÃO E PROJETOS
 */
export const api = {
    
    auth: {
        login: async (email: string, password: string) => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw new Error("E-mail ou senha incorretos.");

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
            console.log("Criando usuário real no backend...");

            const { data: funcData, error: funcError } = await supabase.functions.invoke('create-user', {
                body: {
                    email: accessData.email,
                    password: accessData.tempPassword,
                    name: accessData.clientName
                }
            });

            if (funcError) {
                console.error("Erro ao criar usuário:", funcError);
                throw funcError;
            }

            return { success: true, userId: funcData?.user_id };
        },

        getAll: async () => {
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    id, user_id, client_name, email, project_name, status, progress, due_date, next_milestone,
                    total_value, paid_value, files, notifications, contract, payment_order, last_update,
                    profiles:user_id (full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map((p: any) => ({
                id: p.id,
                userId: p.user_id,
                clientName: p.client_name || p.profiles?.full_name || 'Cliente',
                email: p.email || p.profiles?.email || '',
                projectName: p.project_name,
                status: p.status,
                progress: p.progress || 0,
                dueDate: p.due_date,
                nextMilestone: p.next_milestone,
                financial: {
                    total: p.total_value || 0,
                    paid: p.paid_value || 0,
                    status: p.paid_value >= p.total_value ? 'paid' : p.paid_value > 0 ? 'partial' : 'pending'
                },
                files: p.files || [],
                notifications: p.notifications || [],
                contract: p.contract,
                paymentOrder: p.payment_order,
                lastUpdate: p.last_update || 'Nunca'
            }));
        },

        create: async (projectData: { clientName: string; email: string; projectName: string; totalValue: number }) => {
            const { data: authData } = await supabase.auth.getSession();
            
            if (!authData.session) throw new Error("Não autenticado");

            const { data, error } = await supabase.from('projects').insert({
                user_id: authData.session.user.id,
                client_name: projectData.clientName,
                email: projectData.email,
                project_name: projectData.projectName,
                status: 'new',
                total_value: projectData.totalValue,
                metadata: { client_email: projectData.email }
            }).select().single();

            if (error) throw error;

            return {
                id: data.id,
                clientName: data.client_name,
                email: data.email,
                projectName: data.project_name,
                financial: { total: data.total_value, paid: 0, status: 'pending' }
            };
        },

        update: async (id: string, data: Partial<ClientProject>) => {
            const dbUpdates: any = {};
            if (data.projectName) dbUpdates.project_name = data.projectName;
            if (data.clientName) dbUpdates.client_name = data.clientName;
            if (data.email) dbUpdates.email = data.email;
            if (data.status) dbUpdates.status = data.status;
            if (data.progress !== undefined) dbUpdates.progress = data.progress;
            if (data.dueDate) dbUpdates.due_date = data.dueDate;
            if (data.nextMilestone) dbUpdates.next_milestone = data.nextMilestone;
            if (data.financial) {
                dbUpdates.total_value = data.financial.total;
                dbUpdates.paid_value = data.financial.paid;
            }
            if (data.files) dbUpdates.files = data.files;
            if (data.notifications) dbUpdates.notifications = data.notifications;
            if (data.contract) dbUpdates.contract = data.contract;
            if (data.paymentOrder) dbUpdates.payment_order = data.paymentOrder;
            if (data.lastUpdate) dbUpdates.last_update = data.lastUpdate;

            const { error } = await supabase.from('projects').update(dbUpdates).eq('id', id);
            if (error) throw error;
        }
    }
};
