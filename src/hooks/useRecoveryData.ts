import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useRecoveryData() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('action_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPayments(data);
    }
    setLoading(false);
  };

  const seedSampleDataToSupabase = async () => {
    setIsSeeding(true);
    // Optional seeding function placeholder
    setIsSeeding(false);
  };

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('realtime_action_log')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'action_log' },
        (payload) => {
          setPayments((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    payments,
    loading,
    isSeeding,
    seedSampleDataToSupabase,
    refetch: fetchLogs,
  };
}