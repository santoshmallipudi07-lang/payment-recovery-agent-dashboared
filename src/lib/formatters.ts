/**
 * Format paise (integer) to Indian Rupee (INR) currency string with ₹ symbol.
 * Example: 1499900 paise -> ₹14,999
 */
export function formatINR(paise: number, includeDecimals = false): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(rupees);
}

/**
 * Format rupees directly
 */
export function formatRupees(rupees: number, includeDecimals = false): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(rupees);
}

/**
 * Shorten Razorpay payment ID for clean table presentation
 * Example: pay_9x2bK48f912a -> pay_9x2b...912a
 */
export function shortenId(id: string, startChars = 8, endChars = 4): string {
  if (!id) return '';
  if (id.length <= startChars + endChars) return id;
  return `${id.slice(0, startChars)}...${id.slice(-endChars)}`;
}

/**
 * Format relative timestamp (e.g. "4m ago", "1h ago", "2d ago")
 */
export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Just now';
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffSec = Math.floor((now - date) / 1000);

  if (isNaN(diffSec) || diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

/**
 * Format full date & time in Indian Standard Time (IST) or user locale
 */
export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Clean up failure reasons into human-readable labels
 */
export function formatFailureReason(reason: string): string {
  const map: Record<string, string> = {
    gateway_technical_error: 'Gateway Technical Error',
    insufficient_funds: 'Insufficient Funds',
    bank_server_down: 'Bank Server Down',
    card_limit_exceeded: 'Card Limit Exceeded',
    user_cancelled: 'User Abandoned',
    otp_expired: 'OTP Expired',
    high_risk_fraud_flag: 'High Risk Risk-Check',
    incorrect_cvv: 'Incorrect CVV',
    expired_card: 'Expired Card',
  };

  return map[reason] || reason.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
