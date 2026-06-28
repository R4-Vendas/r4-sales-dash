import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useLeads(userId) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOwnLeads = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('leads_crm')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar leads:', error.message);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchOwnLeads();
  }, [fetchOwnLeads]);

  const addLead = async (lead) => {
    const { error } = await supabase.from('leads_crm').insert({
      user_id: userId,
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      status: lead.status,
      data_entrada: lead.dataEntrada,
      negocio: lead.negocio,
      valor: parseFloat(lead.valor),
    });
    if (error) {
      console.error('Erro ao adicionar lead:', error.message);
      return { error };
    }
    await fetchOwnLeads();
    return { error: null };
  };

  const updateLead = async (id, lead) => {
    const { error } = await supabase
      .from('leads_crm')
      .update({
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        status: lead.status,
        data_entrada: lead.dataEntrada,
        negocio: lead.negocio,
        valor: parseFloat(lead.valor),
      })
      .eq('id', id);
    if (error) {
      console.error('Erro ao atualizar lead:', error.message);
      return { error };
    }
    await fetchOwnLeads();
    return { error: null };
  };

  const deleteLead = async (id) => {
    const { error } = await supabase.from('leads_crm').delete().eq('id', id);
    if (error) {
      console.error('Erro ao excluir lead:', error.message);
      return { error };
    }
    await fetchOwnLeads();
    return { error: null };
  };

  return { leads, loading, addLead, updateLead, deleteLead, refetch: fetchOwnLeads };
}

export function useTeamLeads(isAdmin) {
  const [teamLeads, setTeamLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('leads_crm')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Erro ao buscar leads da equipe:', error.message);
    setTeamLeads(data || []);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { teamLeads, loading, refetch: fetchAll };
}
