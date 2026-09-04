import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  FailedPayment, 
  ActionLog, 
  AuditTrailItem, 
  RecoveryMetrics, 
  ActionDistribution,
  FailureReasonDistribution 
} from '../types/database';
import { 
  getSupabaseClient, 
  getSupabaseCredentials 
} from '../lib/supabase';
import { 
  MOCK_FAILED_PAYMENTS, 
  MOCK_ACTION_LOG, 
  buildJoinedAuditTrail 
} from '../lib/mockData';
import { formatFailureReason } from '../lib/formatters';

export function useRecoveryData() {
  const [payments, setPayments] = useState<FailedPayment[]>([]);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const client = getSupabaseClient();
    const creds = getSupabaseCredentials();

    // If no credentials configured, default to high-fidelity mock dataset
    if (!client || !creds.isConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setPayments(MOCK_FAILED_PAYMENTS);
      setActionLogs(MOCK_ACTION_LOG);
      setIsUsingMockData(true);
      setLoading(false);
      setLastUpdated(new Date());
      return;
    }

    try {
      // 1. Fetch failed_payments (or singular failed_payment)
      let paymentsData: any[] | null = null;
      let fpError: any = null;

      const fpRes = await client.from('failed_payments').select('*');
      if (fpRes.error) {
        // Try singular name
        const altFp = await client.from('failed_payment').select('*');
        if (!altFp.error) {
          paymentsData = altFp.data;
        } else {
          fpError = fpRes.error;
        }
      } else {
        paymentsData = fpRes.data;
      }

      if (fpError) {
        throw new Error(`failed_payments query failed: ${fpError.message}`);
      }

      // 2. Fetch action_log (or plural action_logs)
      let actionLogsData: any[] | null = null;
      let alError: any = null;

      const alRes = await client.from('action_log').select('*');
      if (alRes.error) {
        // Try plural name
        const altAl = await client.from('action_logs').select('*');
        if (!altAl.error) {
          actionLogsData = altAl.data;
        } else {
          alError = alRes.error;
        }
      } else {
        actionLogsData = alRes.data;
      }

      if (alError) {
        throw new Error(`action_log query failed: ${alError.message}`);
      }

      // Sort client-side safely without crashing if created_at does not exist
      const sortedPayments = (paymentsData || []).slice().sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return String(b.id || '').localeCompare(String(a.id || ''));
      });

      const sortedActions = (actionLogsData || []).slice().sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return String(b.id || '').localeCompare(String(a.id || ''));
      });

      setPayments(sortedPayments as FailedPayment[]);
      setActionLogs(sortedActions as ActionLog[]);
      setIsUsingMockData(false);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.warn('Supabase fetch failed, falling back to demo dataset:', err);
      setError(err?.message || 'Could not fetch data from Supabase tables.');
      // Keep mock data as fallback so UI remains functional while showing error
      setPayments(MOCK_FAILED_PAYMENTS);
      setActionLogs(MOCK_ACTION_LOG);
      setIsUsingMockData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Optional: Seed sample test records into the user's Supabase database
  const seedSampleDataToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase client is not configured.' };
    }

    setIsSeeding(true);
    try {
      // Determine table names
      let fpTable = 'failed_payments';
      const testFp = await client.from('failed_payments').select('id', { head: true });
      if (testFp.error) fpTable = 'failed_payment';

      let alTable = 'action_log';
      const testAl = await client.from('action_log').select('id', { head: true });
      if (testAl.error) alTable = 'action_logs';

      // Insert payments
      const { error: insFpErr } = await client.from(fpTable).upsert(
        MOCK_FAILED_PAYMENTS.map(p => ({
          id: p.id,
          amount: p.amount,
          method: p.method,
          failure_reason: p.failure_reason,
          retry_count: p.retry_count,
          status: p.status,
          created_at: p.created_at,
          customer_email: p.customer_email,
          customer_name: p.customer_name
        }))
      );

      if (insFpErr) throw insFpErr;

      // Insert actions
      const { error: insAlErr } = await client.from(alTable).upsert(
        MOCK_ACTION_LOG.map(a => ({
          id: a.id,
          failed_payment_id: a.failed_payment_id,
          action_taken: a.action_taken,
          reasoning: a.reasoning,
          outcome: a.outcome,
          created_at: a.created_at
        }))
      );

      if (insAlErr) throw insAlErr;

      await fetchData();
      return { 
        success: true, 
        message: `Successfully populated ${MOCK_FAILED_PAYMENTS.length} sample failed payments into your Supabase database!` 
      };
    } catch (err: any) {
      return { 
        success: false, 
        message: `Seeding failed: ${err?.message || 'Database error'}` 
      };
    } finally {
      setIsSeeding(false);
    }
  };

  // Compute Joined Audit Trail
  const auditTrail: AuditTrailItem[] = useMemo(() => {
    return buildJoinedAuditTrail(payments, actionLogs);
  }, [payments, actionLogs]);

  // Compute Metrics
  const metrics: RecoveryMetrics = useMemo(() => {
    let totalAtRiskPaise = 0;
    let totalRecoveredPaise = 0;
    let escalatedCount = 0;
    let escalatedPaise = 0;
    let stillOpenCount = 0;
    let stillOpenPaise = 0;
    let recoveredCount = 0;

    payments.forEach((p) => {
      totalAtRiskPaise += Number(p.amount) || 0;

      if (p.status === 'recovered') {
        totalRecoveredPaise += Number(p.amount) || 0;
        recoveredCount += 1;
      } else if (p.status === 'escalated') {
        escalatedCount += 1;
        escalatedPaise += Number(p.amount) || 0;
      } else {
        stillOpenCount += 1;
        stillOpenPaise += Number(p.amount) || 0;
      }
    });

    const recoveryRatePercent =
      totalAtRiskPaise > 0
        ? Number(((totalRecoveredPaise / totalAtRiskPaise) * 100).toFixed(1))
        : 0;

    return {
      totalAtRiskPaise,
      totalAtRiskINR: totalAtRiskPaise / 100,
      totalRecoveredPaise,
      totalRecoveredINR: totalRecoveredPaise / 100,
      escalatedCount,
      escalatedAmountINR: escalatedPaise / 100,
      stillOpenCount,
      stillOpenAmountINR: stillOpenPaise / 100,
      recoveredCount,
      totalCount: payments.length,
      recoveryRatePercent,
    };
  }, [payments]);

  // Compute Action Breakdown for Recharts Donut
  const actionBreakdown: ActionDistribution[] = useMemo(() => {
    const counts = { retry: 0, nudge: 0, escalate: 0 };
    const recoveredCounts = { retry: 0, nudge: 0, escalate: 0 };

    auditTrail.forEach((item) => {
      const act = item.actionTaken;
      if (act === 'retry' || act === 'nudge' || act === 'escalate') {
        counts[act] += 1;
        if (item.outcome === 'recovered' || item.paymentStatus === 'recovered') {
          recoveredCounts[act] += 1;
        }
      }
    });

    const total = (counts.retry + counts.nudge + counts.escalate) || 1;

    return [
      {
        name: 'Smart Retry',
        action: 'retry',
        count: counts.retry,
        percentage: Math.round((counts.retry / total) * 100),
        color: '#d4a349', // Warm gold
        recoveredCount: recoveredCounts.retry,
      },
      {
        name: 'Customer Nudge',
        action: 'nudge',
        count: counts.nudge,
        percentage: Math.round((counts.nudge / total) * 100),
        color: '#60a5fa', // Soft ice blue
        recoveredCount: recoveredCounts.nudge,
      },
      {
        name: 'Human Escalation',
        action: 'escalate',
        count: counts.escalate,
        percentage: Math.round((counts.escalate / total) * 100),
        color: '#f87171', // Muted crimson
        recoveredCount: recoveredCounts.escalate,
      },
    ];
  }, [auditTrail]);

  // Compute Failure Reasons
  const failureReasonBreakdown: FailureReasonDistribution[] = useMemo(() => {
    const map = new Map<string, { count: number; amountPaise: number; recovered: number }>();

    payments.forEach((p) => {
      const reason = p.failure_reason || 'unknown_error';
      const cur = map.get(reason) || { count: 0, amountPaise: 0, recovered: 0 };
      cur.count += 1;
      cur.amountPaise += Number(p.amount) || 0;
      if (p.status === 'recovered') cur.recovered += 1;
      map.set(reason, cur);
    });

    return Array.from(map.entries())
      .map(([reason, stats]) => ({
        reason,
        displayName: formatFailureReason(reason),
        count: stats.count,
        amountINR: stats.amountPaise / 100,
        recoveredPercent: stats.count > 0 ? Math.round((stats.recovered / stats.count) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [payments]);

  const switchDataSource = (useMock: boolean) => {
    if (useMock) {
      setPayments(MOCK_FAILED_PAYMENTS);
      setActionLogs(MOCK_ACTION_LOG);
      setIsUsingMockData(true);
      setError(null);
    } else {
      fetchData();
    }
  };

  return {
    payments,
    actionLogs,
    auditTrail,
    metrics,
    actionBreakdown,
    failureReasonBreakdown,
    loading,
    error,
    isUsingMockData,
    lastUpdated,
    isSeeding,
    refresh: fetchData,
    switchDataSource,
    seedSampleDataToSupabase,
  };
}
