import type { FailedPayment, ActionLog, AuditTrailItem } from '../types/database';

export const MOCK_FAILED_PAYMENTS: FailedPayment[] = [
  {
    id: 'pay_9x2bK48f912a',
    amount: 1499900, // ₹14,999.00
    method: 'upi',
    failure_reason: 'gateway_technical_error',
    retry_count: 1,
    status: 'recovered',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    customer_email: 'vikram.singh@enterprise.in',
    customer_name: 'Vikram Singh'
  },
  {
    id: 'pay_8a7cL19e421d',
    amount: 8500000, // ₹85,000.00
    method: 'card',
    failure_reason: 'bank_server_down',
    retry_count: 2,
    status: 'recovered',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    customer_email: 'ananya.deshmukh@fintech.co',
    customer_name: 'Ananya Deshmukh'
  },
  {
    id: 'pay_7c3mP82x990f',
    amount: 320000, // ₹3,200.00
    method: 'upi',
    failure_reason: 'insufficient_funds',
    retry_count: 0,
    status: 'open',
    created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    customer_email: 'rohit.gupta@outlook.com',
    customer_name: 'Rohit Gupta'
  },
  {
    id: 'pay_6e1nQ55w103b',
    amount: 12500000, // ₹1,25,000.00
    method: 'card',
    failure_reason: 'card_limit_exceeded',
    retry_count: 3,
    status: 'escalated',
    created_at: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    customer_email: 'siddharth.mehta@nexuscap.in',
    customer_name: 'Siddharth Mehta'
  },
  {
    id: 'pay_5f9rT22k771e',
    amount: 540000, // ₹5,400.00
    method: 'upi',
    failure_reason: 'user_cancelled',
    retry_count: 1,
    status: 'recovered',
    created_at: new Date(Date.now() - 1000 * 60 * 145).toISOString(),
    customer_email: 'priya.sharma@gmail.com',
    customer_name: 'Priya Sharma'
  },
  {
    id: 'pay_4d8uY66z332p',
    amount: 4500000, // ₹45,000.00
    method: 'netbanking',
    failure_reason: 'gateway_technical_error',
    retry_count: 1,
    status: 'recovered',
    created_at: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
    customer_email: 'amit.verma@clouddrive.io',
    customer_name: 'Amit Verma'
  },
  {
    id: 'pay_3b2vW11a884k',
    amount: 920000, // ₹9,200.00
    method: 'upi',
    failure_reason: 'insufficient_funds',
    retry_count: 0,
    status: 'open',
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    customer_email: 'neha.iyer@techlab.org',
    customer_name: 'Neha Iyer'
  },
  {
    id: 'pay_2a9zX44v551m',
    amount: 19500000, // ₹1,95,000.00
    method: 'card',
    failure_reason: 'high_risk_fraud_flag',
    retry_count: 1,
    status: 'escalated',
    created_at: new Date(Date.now() - 1000 * 60 * 310).toISOString(),
    customer_email: 'karan.johar@ventureprime.co',
    customer_name: 'Karan Johar'
  },
  {
    id: 'pay_1k8jH33g229s',
    amount: 285000, // ₹2,850.00
    method: 'upi',
    failure_reason: 'otp_expired',
    retry_count: 1,
    status: 'recovered',
    created_at: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
    customer_email: 'deepak.rao@innovate.co',
    customer_name: 'Deepak Rao'
  },
  {
    id: 'pay_0m4pQ88d663t',
    amount: 7200000, // ₹72,000.00
    method: 'card',
    failure_reason: 'gateway_technical_error',
    retry_count: 2,
    status: 'recovered',
    created_at: new Date(Date.now() - 1000 * 60 * 520).toISOString(),
    customer_email: 'shreya.nair@globalretail.com',
    customer_name: 'Shreya Nair'
  },
  {
    id: 'pay_9c1vR77t442y',
    amount: 180000, // ₹1,800.00
    method: 'upi',
    failure_reason: 'gateway_technical_error',
    retry_count: 0,
    status: 'open',
    created_at: new Date(Date.now() - 1000 * 60 * 610).toISOString(),
    customer_email: 'manoj.kumar@apex.in',
    customer_name: 'Manoj Kumar'
  },
  {
    id: 'pay_8z5wL33e991u',
    amount: 6400000, // ₹64,000.00
    method: 'netbanking',
    failure_reason: 'bank_server_down',
    retry_count: 3,
    status: 'escalated',
    created_at: new Date(Date.now() - 1000 * 60 * 750).toISOString(),
    customer_email: 'tanvi.patel@horizonlogistics.com',
    customer_name: 'Tanvi Patel'
  }
];

export const MOCK_ACTION_LOG: ActionLog[] = [
  {
    id: 'act_101',
    failed_payment_id: 'pay_9x2bK48f912a',
    action_taken: 'retry',
    reasoning: 'Detected transient network timeout on ICICI UPI switch. Pattern analysis indicates momentary surge. Triggered smart retry via standby HDFC gateway.',
    outcome: 'recovered',
    created_at: new Date(Date.now() - 1000 * 60 * 11).toISOString()
  },
  {
    id: 'act_102',
    failed_payment_id: 'pay_8a7cL19e421d',
    action_taken: 'retry',
    reasoning: 'Bank core banking returned 504 Gateway Timeout on Visa card network. Scheduled automatic backoff retry at 3-minute interval.',
    outcome: 'recovered',
    created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString()
  },
  {
    id: 'act_103',
    failed_payment_id: 'pay_7c3mP82x990f',
    action_taken: 'nudge',
    reasoning: 'Customer account returned insufficient funds error code AC04. Direct automated retries will damage card health. Sent smart WhatsApp notification with single-tap alternate UPI handle link.',
    outcome: 'nudge_sent',
    created_at: new Date(Date.now() - 1000 * 60 * 54).toISOString()
  },
  {
    id: 'act_104',
    failed_payment_id: 'pay_6e1nQ55w103b',
    action_taken: 'escalate',
    reasoning: 'High-value transaction (₹1,25,000.00) failed due to daily card limit. Exceeded maximum automated retry ceiling (3 attempts). Route to enterprise concierge desk for manual phone assist.',
    outcome: 'escalated_by_agent',
    created_at: new Date(Date.now() - 1000 * 60 * 105).toISOString()
  },
  {
    id: 'act_105',
    failed_payment_id: 'pay_5f9rT22k771e',
    action_taken: 'nudge',
    reasoning: 'Checkout abandoned during UPI intent app switch. Dispatched polite SMS & email nudge reminding customer of preserved shopping cart.',
    outcome: 'recovered',
    created_at: new Date(Date.now() - 1000 * 60 * 140).toISOString()
  },
  {
    id: 'act_106',
    failed_payment_id: 'pay_4d8uY66z332p',
    action_taken: 'retry',
    reasoning: 'SBI corporate netbanking portal intermittent 502 handshake error. Re-dispatched transaction through secondary routing gateway after 90s cooldown.',
    outcome: 'recovered',
    created_at: new Date(Date.now() - 1000 * 60 * 185).toISOString()
  },
  {
    id: 'act_107',
    failed_payment_id: 'pay_3b2vW11a884k',
    action_taken: 'nudge',
    reasoning: 'Insufficient balance reported. Customer has high historical LTV. Pushed subtle in-app notification offering split-payment or credit line.',
    outcome: 'nudge_sent',
    created_at: new Date(Date.now() - 1000 * 60 * 238).toISOString()
  },
  {
    id: 'act_108',
    failed_payment_id: 'pay_2a9zX44v551m',
    action_taken: 'escalate',
    reasoning: 'Transaction value ₹1,95,000.00 triggered risk heuristics (new device + foreign IP mismatch). Immediate human verification mandated to prevent chargeback risk.',
    outcome: 'escalated_by_agent',
    created_at: new Date(Date.now() - 1000 * 60 * 308).toISOString()
  },
  {
    id: 'act_109',
    failed_payment_id: 'pay_1k8jH33g229s',
    action_taken: 'nudge',
    reasoning: 'OTP expired during bank 3D-secure challenge. Sent instant WhatsApp prompt enabling seamless one-click retry checkout.',
    outcome: 'recovered',
    created_at: new Date(Date.now() - 1000 * 60 * 395).toISOString()
  },
  {
    id: 'act_110',
    failed_payment_id: 'pay_0m4pQ88d663t',
    action_taken: 'retry',
    reasoning: 'Razorpay reported temporary acquirer downtime. Secondary automated retry executed successfully once acquirer health metric normalized.',
    outcome: 'recovered',
    created_at: new Date(Date.now() - 1000 * 60 * 515).toISOString()
  },
  {
    id: 'act_111',
    failed_payment_id: 'pay_9c1vR77t442y',
    action_taken: 'retry',
    reasoning: 'Intermittent NPCI server latency during peak hour traffic. Queued for scheduled retry attempt #1 in next 10-minute cycle.',
    outcome: 'retry_scheduled',
    created_at: new Date(Date.now() - 1000 * 60 * 608).toISOString()
  },
  {
    id: 'act_112',
    failed_payment_id: 'pay_8z5wL33e991u',
    action_taken: 'escalate',
    reasoning: 'Axis Bank Netbanking maintenance window exceeded 2 hours. High value order ₹64,000.00 escalated to finance operations team for RTGS/NEFT alternative.',
    outcome: 'escalated_by_agent',
    created_at: new Date(Date.now() - 1000 * 60 * 745).toISOString()
  }
];

export function buildJoinedAuditTrail(
  payments: FailedPayment[],
  actions: ActionLog[]
): AuditTrailItem[] {
  const paymentMap = new Map<string, FailedPayment>();
  payments.forEach((p) => paymentMap.set(p.id, p));

  return actions.map((act) => {
    const payment = paymentMap.get(act.failed_payment_id);
    const amountPaise = payment ? payment.amount : 0;
    const amountINR = amountPaise / 100;

    return {
      id: act.id,
      paymentId: act.failed_payment_id,
      amountPaise,
      amountINR,
      method: payment?.method || 'unknown',
      failureReason: payment?.failure_reason || 'unknown_error',
      retryCount: payment?.retry_count ?? 0,
      paymentStatus: payment?.status || 'open',
      actionTaken: act.action_taken,
      reasoning: act.reasoning,
      outcome: act.outcome,
      timestamp: act.created_at || payment?.created_at || new Date().toISOString(),
      customerEmail: payment?.customer_email,
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
