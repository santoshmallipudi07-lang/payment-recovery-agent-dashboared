import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { 
  FailedPayment, 
  AuditTrailItem, 
  RecoveryMetrics, 
  ActionDistribution,
  FailureReasonDistribution,
  ActionTaken,
  PaymentStatus 
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

// Flexible parser for audit_logs or action_log table rows
export function normalizeAuditLogRow(row: any, paymentsMap?: Map<string, FailedPayment>): AuditTrailItem {
  const paymentId = String(
    row.failed_payment_id || 
    row.payment_id || 
    row.paymentId || 
    row.razorpay_payment_id ||
    row.id || 
    'pay_unknown'
  );

  const payment = paymentsMap?.get(paymentId);

  // Parse Action
  const rawAction = String(row.action_taken || row.action || row.decision || 'retry').toLowerCase();
  const actionTaken: ActionTaken = rawAction.includes('nudge')
    ? 'nudge'
    : rawAction.includes('escalat')
    ? 'escalate'
    : 'retry';

  // Parse Amount (Paise)
  let amountPaise = 0;
  if (payment?.amount !== undefined) {
    amountPaise = Number(payment.amount) || 0;
  } else if (row.amount !== undefined) {
    amountPaise = Number(row.amount) || 0;
  } else if (row.amount_paise !== undefined) {
    amountPaise = Number(row.amount_paise) || 0;
  } else if (row.amount_inr !== undefined) {
    amountPaise = Math.round((Number(row.amount_inr) || 0) * 100);
  }

  const amountINR = amountPaise / 100;

  // Parse Method
  const method = String(
    payment?.method || row.method || row.payment_method || 'upi'
  ).toLowerCase();

  // Parse Failure Reason
  const failureReason = String(
    payment?.failure_reason || 
    row.failure_reason || 
    row.error_reason || 
    row.error_code || 
    row.reason_code ||
    'gateway_technical_error'
  );

  // Parse Outcome
  const outcome = String(row.outcome || row.status || 'pending').toLowerCase();

  // Parse Status
  let paymentStatus: PaymentStatus = 'open';
  if (payment?.status) {
    paymentStatus = payment.status;
  } else if (outcome === 'recovered') {
    paymentStatus = 'recovered';
  } else if (outcome.includes('escalat')) {
    paymentStatus = 'escalated';
  }

  return {
    id: row.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    paymentId,
    amountPaise,
    amountINR,
    method,
    failureReason,
    retryCount: Number(payment?.retry_count ?? row.retry_count ?? row.retryCount ?? 0),
    paymentStatus,
    actionTaken,
    reasoning: String(
      row.reasoning || 
      row.reason || 
      row.message || 
      row.explanation || 
      'Autonomous recovery agent evaluated transaction heuristics.'
    ),
    outcome,
    timestamp: row.created_at || row.timestamp || row.inserted_at || new Date().toISOString(),
    customerEmail: payment?.customer_email || row.customer_email || row.email,
  };
}

export function useRecoveryData() {
  const [payments, setPayments] = useState<FailedPayment[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrailItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [realtimeEventsCount, setRealtimeEventsCount] = useState<number>(0);
  const [activeAuditTable, setActiveAuditTable] = useState<string>('audit_logs');
  const [recentInsertedIds, setRecentInsertedIds] = useState<Set<string | number>>(new Set());

  // Ref to always access latest payments inside real-time subscription callbacks
  const paymentsRef = useRef<FailedPayment[]>(payments);
  paymentsRef.current = payments;

  // 1. Initial Fetch from Supabase
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const client = getSupabaseClient();
    const creds = getSupabaseCredentials();

    // If no credentials configured, show the initial demo preview
    if (!client || !creds.isConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setPayments(MOCK_FAILED_PAYMENTS);
      setAuditTrail(buildJoinedAuditTrail(MOCK_FAILED_PAYMENTS, MOCK_ACTION_LOG));
      setIsUsingMockData(true);
      setLoading(false);
      setLastUpdated(new Date());
      return;
    }

    try {
      // 1. Fetch failed_payments if table exists
      let paymentsData: FailedPayment[] = [];
      const fpRes = await client.from('failed_payments').select('*');
      if (!fpRes.error && Array.isArray(fpRes.data)) {
        paymentsData = fpRes.data as FailedPayment[];
      } else {
        const altFp = await client.from('failed_payment').select('*');
        if (!altFp.error && Array.isArray(altFp.data)) {
          paymentsData = altFp.data as FailedPayment[];
        }
      }

      const paymentsMap = new Map<string, FailedPayment>();
      paymentsData.forEach((p) => paymentsMap.set(p.id, p));

      // 2. Fetch initial records from audit_logs table (Priority)
      let rawLogs: any[] = [];
      let detectedTable = 'audit_logs';

      const auditRes = await client.from('audit_logs').select('*');
      if (!auditRes.error && Array.isArray(auditRes.data)) {
        rawLogs = auditRes.data;
        detectedTable = 'audit_logs';
      } else {
        // Fallback to action_log or action_logs
        const alRes = await client.from('action_log').select('*');
        if (!alRes.error && Array.isArray(alRes.data)) {
          rawLogs = alRes.data;
          detectedTable = 'action_log';
        } else {
          const alRes2 = await client.from('action_logs').select('*');
          if (!alRes2.error && Array.isArray(alRes2.data)) {
            rawLogs = alRes2.data;
            detectedTable = 'action_logs';
          } else {
            // Neither table found - notify user cleanly
            throw new Error(
              auditRes.error?.message || 
              alRes.error?.message || 
              "Table 'audit_logs' was not found in Supabase."
            );
          }
        }
      }

      setActiveAuditTable(detectedTable);

      // Normalize all initial logs
      const normalizedItems: AuditTrailItem[] = rawLogs.map((row) =>
        normalizeAuditLogRow(row, paymentsMap)
      );

      // Sort chronological (most recent first)
      normalizedItems.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // If payments table wasn't present, build synthesized payments list from audit_logs
      if (paymentsData.length === 0 && normalizedItems.length > 0) {
        const uniquePayments = new Map<string, FailedPayment>();
        normalizedItems.forEach((item) => {
          if (!uniquePayments.has(item.paymentId)) {
            uniquePayments.set(item.paymentId, {
              id: item.paymentId,
              amount: item.amountPaise,
              method: item.method,
              failure_reason: item.failureReason,
              retry_count: item.retryCount,
              status: item.paymentStatus,
              created_at: item.timestamp,
              customer_email: item.customerEmail,
            });
          }
        });
        paymentsData = Array.from(uniquePayments.values());
      }

      // STRICT: Replace static seed data! User's live database is now displayed.
      setPayments(paymentsData);
      setAuditTrail(normalizedItems);
      setIsUsingMockData(false);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.warn('Supabase fetch failed:', err);
      setError(err?.message || 'Could not fetch records from audit_logs.');
      // When connection fails, show empty state or helpful error, do not silently mask
      setPayments([]);
      setAuditTrail([]);
      setIsUsingMockData(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Real-time Subscription for INSERT Events using @supabase/supabase-js
  useEffect(() => {
    const client = getSupabaseClient();
    const creds = getSupabaseCredentials();

    if (!client || !creds.isConfigured || isUsingMockData) {
      setIsRealtimeConnected(false);
      return;
    }

    // Subscribe to INSERT events across audit_logs, action_log, and failed_payments
    const channelName = `realtime_webhook_${Date.now()}`;
    const channel = client
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
        },
        (payload) => {
          console.log('⚡ Realtime INSERT on audit_logs:', payload.new);
          handleIncomingAuditLog(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'action_log',
        },
        (payload) => {
          console.log('⚡ Realtime INSERT on action_log:', payload.new);
          handleIncomingAuditLog(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'failed_payments',
        },
        (payload) => {
          console.log('⚡ Realtime INSERT on failed_payments:', payload.new);
          handleIncomingPayment(payload.new);
        }
      )
      .subscribe((status) => {
        console.log(`Realtime channel [${channelName}] status:`, status);
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log(`Removing realtime channel [${channelName}]`);
      client.removeChannel(channel);
      setIsRealtimeConnected(false);
    };
  }, [isUsingMockData]);

  // Handle incoming real-time audit log
  const handleIncomingAuditLog = useCallback((newRow: any) => {
    const currentPayments = paymentsRef.current;
    const paymentsMap = new Map<string, FailedPayment>();
    currentPayments.forEach((p) => paymentsMap.set(p.id, p));

    const newItem = normalizeAuditLogRow(newRow, paymentsMap);

    // Update Audit Trail (prepend to top)
    setAuditTrail((prev) => {
      // Avoid duplicates
      const filtered = prev.filter((item) => item.id !== newItem.id);
      return [newItem, ...filtered];
    });

    // Update or add payment in state to reflect new live metric
    setPayments((prev) => {
      const idx = prev.findIndex((p) => p.id === newItem.paymentId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          status: newItem.paymentStatus,
          retry_count: Math.max(updated[idx].retry_count, newItem.retryCount),
        };
        return updated;
      } else {
        return [
          {
            id: newItem.paymentId,
            amount: newItem.amountPaise,
            method: newItem.method,
            failure_reason: newItem.failureReason,
            retry_count: newItem.retryCount,
            status: newItem.paymentStatus,
            created_at: newItem.timestamp,
            customer_email: newItem.customerEmail,
          },
          ...prev,
        ];
      }
    });

    // Highlight row briefly
    setRecentInsertedIds((prev) => new Set(prev).add(newItem.id));
    setTimeout(() => {
      setRecentInsertedIds((prev) => {
        const next = new Set(prev);
        next.delete(newItem.id);
        return next;
      });
    }, 4500);

    setRealtimeEventsCount((c) => c + 1);
    setLastUpdated(new Date());
  }, []);

  // Handle incoming real-time failed_payment
  const handleIncomingPayment = useCallback((newPayment: any) => {
    const mappedPayment: FailedPayment = {
      id: String(newPayment.id),
      amount: Number(newPayment.amount) || 0,
      method: String(newPayment.method || 'upi'),
      failure_reason: String(newPayment.failure_reason || 'unknown_error'),
      retry_count: Number(newPayment.retry_count) || 0,
      status: (newPayment.status as PaymentStatus) || 'open',
      created_at: newPayment.created_at || new Date().toISOString(),
      customer_email: newPayment.customer_email,
      customer_name: newPayment.customer_name,
    };

    setPayments((prev) => {
      const filtered = prev.filter((p) => p.id !== mappedPayment.id);
      return [mappedPayment, ...filtered];
    });

    setRealtimeEventsCount((c) => c + 1);
    setLastUpdated(new Date());
  }, []);

  // 3. Compute Metrics
  const metrics: RecoveryMetrics = useMemo(() => {
    // If payments array has items, compute from payments
    // If payments array is empty but auditTrail has items, compute directly from auditTrail
    const sourcePayments: Array<{ amountPaise: number; status: string }> = 
      payments.length > 0
        ? payments.map((p) => ({ amountPaise: Number(p.amount) || 0, status: p.status }))
        : auditTrail.map((a) => ({ amountPaise: a.amountPaise, status: a.paymentStatus }));

    let totalAtRiskPaise = 0;
    let totalRecoveredPaise = 0;
    let escalatedCount = 0;
    let escalatedPaise = 0;
    let stillOpenCount = 0;
    let stillOpenPaise = 0;
    let recoveredCount = 0;

    sourcePayments.forEach((p) => {
      totalAtRiskPaise += p.amountPaise;

      if (p.status === 'recovered') {
        totalRecoveredPaise += p.amountPaise;
        recoveredCount += 1;
      } else if (p.status === 'escalated') {
        escalatedCount += 1;
        escalatedPaise += p.amountPaise;
      } else {
        stillOpenCount += 1;
        stillOpenPaise += p.amountPaise;
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
      totalCount: sourcePayments.length,
      recoveryRatePercent,
    };
  }, [payments, auditTrail]);

  // 4. Compute Action Breakdown for Recharts Donut
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

  // 5. Compute Failure Reasons Breakdown
  const failureReasonBreakdown: FailureReasonDistribution[] = useMemo(() => {
    const map = new Map<string, { count: number; amountPaise: number; recovered: number }>();

    if (auditTrail.length > 0) {
      auditTrail.forEach((a) => {
        const reason = a.failureReason || 'unknown_error';
        const cur = map.get(reason) || { count: 0, amountPaise: 0, recovered: 0 };
        cur.count += 1;
        cur.amountPaise += a.amountPaise;
        if (a.paymentStatus === 'recovered' || a.outcome === 'recovered') cur.recovered += 1;
        map.set(reason, cur);
      });
    } else {
      payments.forEach((p) => {
        const reason = p.failure_reason || 'unknown_error';
        const cur = map.get(reason) || { count: 0, amountPaise: 0, recovered: 0 };
        cur.count += 1;
        cur.amountPaise += Number(p.amount) || 0;
        if (p.status === 'recovered') cur.recovered += 1;
        map.set(reason, cur);
      });
    }

    return Array.from(map.entries())
      .map(([reason, stats]) => ({
        reason,
        displayName: formatFailureReason(reason),
        count: stats.count,
        amountINR: stats.amountPaise / 100,
        recoveredPercent: stats.count > 0 ? Math.round((stats.recovered / stats.count) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [payments, auditTrail]);

  // Switch between mock demo and live Supabase
  const switchDataSource = (useMock: boolean) => {
    if (useMock) {
      setPayments(MOCK_FAILED_PAYMENTS);
      setAuditTrail(buildJoinedAuditTrail(MOCK_FAILED_PAYMENTS, MOCK_ACTION_LOG));
      setIsUsingMockData(true);
      setError(null);
    } else {
      fetchData();
    }
  };

  return {
    payments,
    auditTrail,
    metrics,
    actionBreakdown,
    failureReasonBreakdown,
    loading,
    error,
    isUsingMockData,
    lastUpdated,
    isRealtimeConnected,
    realtimeEventsCount,
    activeAuditTable,
    recentInsertedIds,
    refresh: fetchData,
    switchDataSource,
  };
}
