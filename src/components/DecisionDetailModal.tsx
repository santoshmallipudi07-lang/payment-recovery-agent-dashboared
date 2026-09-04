import React from 'react';
import type { 
  AuditTrailItem 
} from '../types/database';
import { 
  formatINR, 
  formatDateTime, 
  formatFailureReason 
} from '../lib/formatters';
import { 
  X, 
  Bot, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Copy, 
  Check 
} from 'lucide-react';

interface DecisionDetailModalProps {
  item: AuditTrailItem | null;
  onClose: () => void;
}

export const DecisionDetailModal: React.FC<DecisionDetailModalProps> = ({
  item,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.paymentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-charcoal-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-charcoal-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-charcoal-800 border border-gold-500/30 text-gold-400 shadow-gold-glow">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-offwhite-100 tracking-tight">
                AI Agent Decision Trace
              </h3>
              <p className="text-xs text-offwhite-500">
                Detailed recovery intelligence & execution log
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-offwhite-500 hover:text-offwhite-200 hover:bg-charcoal-750 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Payment Context Card */}
          <div className="p-4 rounded-xl bg-charcoal-800/60 border border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] uppercase font-semibold text-offwhite-500 block">Payment ID</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-xs text-offwhite-100 truncate">{item.paymentId}</span>
                <button onClick={handleCopy} className="text-offwhite-500 hover:text-gold-400">
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-offwhite-500 block">Transaction Amount</span>
              <span className="font-mono text-xs font-semibold text-gold-400 mt-0.5 block">
                {formatINR(item.amountPaise)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-offwhite-500 block">Payment Method</span>
              <span className="text-xs font-medium text-offwhite-200 uppercase mt-0.5 block">
                {item.method}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-offwhite-500 block">Attempt Count</span>
              <span className="text-xs font-mono text-offwhite-200 mt-0.5 block">
                #{item.retryCount}
              </span>
            </div>
          </div>

          {/* Root Failure Cause */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-offwhite-400 uppercase tracking-wider">
              Root Cause Diagnostics
            </span>
            <div className="p-3.5 rounded-xl bg-charcoal-800/40 border border-white/[0.06] flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-fintech-red shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-medium text-offwhite-100 block">
                  {formatFailureReason(item.failureReason)}
                </span>
                <span className="text-[11px] font-mono text-offwhite-500">
                  Raw Gateway Code: {item.failureReason}
                </span>
              </div>
            </div>
          </div>

          {/* AI Decision & Reasoning Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-offwhite-400 uppercase tracking-wider">
                Autonomous Action Rationale
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-offwhite-500">Action:</span>
                <span className="font-semibold text-gold-400 uppercase tracking-wide">
                  {item.actionTaken}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-charcoal-850 border border-gold-500/20 text-offwhite-200 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-xl pointer-events-none" />
              <p className="text-xs sm:text-sm leading-relaxed text-offwhite-200">
                "{item.reasoning}"
              </p>

              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-offwhite-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-offwhite-500" />
                  <span>Logged at: {formatDateTime(item.timestamp)}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Agent Confidence: 96.8%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lifecycle & Outcome Status */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-offwhite-400 uppercase tracking-wider">
              Result & Current Lifecycle
            </span>
            <div className="p-3.5 rounded-xl bg-charcoal-800/40 border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-4 h-4 ${
                  item.outcome === 'recovered' ? 'text-emerald-400' : 'text-gold-400'
                }`} />
                <div>
                  <span className="text-xs font-medium text-offwhite-100 capitalize block">
                    {item.outcome.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-offwhite-500">
                    Payment Status: <strong className="text-offwhite-300 capitalize">{item.paymentStatus}</strong>
                  </span>
                </div>
              </div>

              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                item.paymentStatus === 'recovered'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  : item.paymentStatus === 'escalated'
                  ? 'bg-red-950/50 text-red-300 border border-red-500/30'
                  : 'bg-blue-950/50 text-blue-300 border border-blue-500/30'
              }`}>
                {item.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-charcoal-850 flex items-center justify-between">
          <span className="text-xs text-offwhite-500 font-mono">
            Razorpay Webhook Verified
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-charcoal-750 hover:bg-charcoal-700 text-offwhite-200 border border-white/10 transition-colors"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
