export type PaymentStatus = 'open' | 'recovered' | 'escalated';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi';
export type ActionTaken = 'retry' | 'nudge' | 'escalate';
export type ActionOutcome = 
  | 'recovered' 
  | 'nudge_sent' 
  | 'escalated_by_agent' 
  | 'retry_failed' 
  | 'retry_scheduled'
  | 'pending';

export interface FailedPayment {
  id: string;
  amount: number; // in paise
  method: string;
  failure_reason: string;
  retry_count: number;
  status: PaymentStatus;
  created_at?: string;
  customer_email?: string;
  customer_name?: string;
}

export interface ActionLog {
  id: string | number;
  failed_payment_id: string;
  action_taken: ActionTaken;
  reasoning: string;
  outcome: ActionOutcome | string;
  created_at?: string;
}

// Joined representation for high-fidelity audit trail display
export interface AuditTrailItem {
  id: string | number;
  paymentId: string;
  amountPaise: number;
  amountINR: number;
  method: string;
  failureReason: string;
  retryCount: number;
  paymentStatus: PaymentStatus;
  actionTaken: ActionTaken;
  reasoning: string;
  outcome: string;
  timestamp: string;
  customerEmail?: string;
}

export interface RecoveryMetrics {
  totalAtRiskPaise: number;
  totalAtRiskINR: number;
  totalRecoveredPaise: number;
  totalRecoveredINR: number;
  escalatedCount: number;
  escalatedAmountINR: number;
  stillOpenCount: number;
  stillOpenAmountINR: number;
  recoveredCount: number;
  totalCount: number;
  recoveryRatePercent: number;
}

export interface ActionDistribution {
  name: string;
  action: ActionTaken;
  count: number;
  percentage: number;
  color: string;
  recoveredCount: number;
}

export interface FailureReasonDistribution {
  reason: string;
  displayName: string;
  count: number;
  amountINR: number;
  recoveredPercent: number;
}

export interface MethodDistribution {
  method: string;
  count: number;
  recoveredCount: number;
  amountINR: number;
}
