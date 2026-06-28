import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const today = () => new Date().toISOString().slice(0, 10);

export function useKpis(userId) {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOwnKpis = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 60);
    const { data, error } = await supabase
      .from('kpis_diarios')
      .select('*')
      .eq('user_id', userId)
      .gte('data', cutoff.toISOString().slice(0, 10))
      .order('data', { ascending: true });

    if (error) {
      console.error('Erro ao buscar KPIs:', error.message);
    } else {
      setKpis(data || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchOwnKpis();
  }, [fetchOwnKpis]);

  const saveDay = async (values) => {
    const payload = {
      user_id: userId,
      data: today(),
      leads_novos: values.leadsNovos,
      abordagem: values.abordagem,
      fup: values.fup,
      em_negociacao: values.emNegociacao,
      fechados: values.fechados,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('kpis_diarios')
      .upsert(payload, { onConflict: 'user_id,data' });

    if (error) {
      console.error('Erro ao salvar KPIs:', error.message);
      return { error };
    }
    await fetchOwnKpis();
    return { error: null };
  };

  return { kpis, loading, saveDay, refetch: fetchOwnKpis };
}

export function useTeamKpis(isAdmin) {
  const [teamKpis, setTeamKpis] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 60);

    const [kpisRes, profilesRes] = await Promise.all([
      supabase
        .from('kpis_diarios')
        .select('*')
        .gte('data', cutoff.toISOString().slice(0, 10))
        .order('data', { ascending: true }),
      supabase
        .from('profiles')
        .select('id, nome, role')
        .eq('role', 'vendedor'),
    ]);

    if (kpisRes.error) console.error('Erro ao buscar KPIs da equipe:', kpisRes.error.message);
    if (profilesRes.error) console.error('Erro ao buscar vendedores:', profilesRes.error.message);

    setTeamKpis(kpisRes.data || []);
    setVendedores(profilesRes.data || []);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { teamKpis, vendedores, loading, refetch: fetchAll };
}
