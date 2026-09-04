import React, { useState, useMemo } from 'react';
import type { 
  AuditTrailItem, 
  ActionTaken 
} from '../types/database';
import { 
  formatINR, 
  shortenId, 
  formatRelativeTime, 
  formatFailureReason 
} from '../lib/formatters';
import { 
  Search, 
  Check, 
  Copy, 
  Zap, 
  MessageSquare, 
  AlertOctagon, 
  CreditCard, 
  Smartphone, 
  Building2, 
  ChevronRight
} from 'lucide-react';

interface AuditTrailTableProps {
  items: AuditTrailItem[];
  onSelectRow: (item: AuditTrailItem) => void;
}

export const AuditTrailTable: React.FC<AuditTrailTableProps> = ({
  items,
  onSelectRow,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy payment ID helper
  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Action filter
      if (actionFilter !== 'all') {
        if (actionFilter === 'recovered') {
          if (item.outcome !== 'recovered' && item.paymentStatus !== 'recovered') return false;
        } else if (item.actionTaken !== actionFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.paymentId.toLowerCase().includes(q);
        const matchReasoning = item.reasoning.toLowerCase().includes(q);
        const matchMethod = item.method.toLowerCase().includes(q);
        const matchOutcome = item.outcome.toLowerCase().includes(q);
        const matchReason = item.failureReason.toLowerCase().includes(q);
        if (!matchId && !matchReasoning && !matchMethod && !matchOutcome && !matchReason) {
          return false;
        }
      }

      return true;
    });
  }, [items, actionFilter, searchQuery]);

  // Method Icon helper
  const getMethodBadge = (method: string) => {
    switch (method.toLowerCase()) {
      case 'upi':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-charcoal-800 text-offwhite-300 border border-white/[0.06]">
            <Smartphone className="w-2.5 h-2.5 text-emerald-400" /> UPI
          </span>
        );
      case 'card':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-charcoal-800 text-offwhite-300 border border-white/[0.06]">
            <CreditCard className="w-2.5 h-2.5 text-gold-400" /> Card
          </span>
        );
      case 'netbanking':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-charcoal-800 text-offwhite-300 border border-white/[0.06]">
            <Building2 className="w-2.5 h-2.5 text-blue-400" /> Netbanking
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-charcoal-800 text-offwhite-400 border border-white/[0.06]">
            {method}
          </span>
        );
    }
  };

  // Action badge pill
  const getActionBadge = (action: ActionTaken) => {
    switch (action) {
      case 'retry':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/40 text-gold-300 border border-gold-500/30">
            <Zap className="w-3 h-3 text-gold-400" />
            <span>Retry</span>
          </span>
        );
      case 'nudge':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-950/40 text-blue-300 border border-blue-500/30">
            <MessageSquare className="w-3 h-3 text-blue-400" />
            <span>Nudge</span>
          </span>
        );
      case 'escalate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-950/40 text-red-300 border border-red-500/30">
            <AlertOctagon className="w-3 h-3 text-red-400" />
            <span>Escalate</span>
          </span>
        );
    }
  };

  // Outcome badge pill (desaturated, calm, not neon)
  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'recovered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Recovered
          </span>
        );
      case 'nudge_sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-950/40 text-blue-300 border border-blue-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Nudge Sent
          </span>
        );
      case 'escalated_by_agent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-950/40 text-red-300 border border-red-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Escalated to Human
          </span>
        );
      case 'retry_scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/40 text-gold-300 border border-gold-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            Retry Queued
          </span>
        );
      case 'retry_failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-950/40 text-red-300 border border-red-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Retry Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-charcoal-800 text-offwhite-400 border border-white/10">
            {outcome.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  return (
    <div className="fintech-card rounded-xl overflow-hidden shadow-subtle-card">
      
      {/* Top Header & Search/Filter Controls */}
      <div className="p-5 sm:p-6 border-b border-white/[0.07] bg-charcoal-900/60">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Section title */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-offwhite-100 tracking-tight">
                Audit Trail & AI Decision Log
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-charcoal-800 text-offwhite-400 border border-white/[0.06]">
                {filteredItems.length} records
              </span>
            </div>
            <p className="text-xs text-offwhite-500 mt-0.5">
              Chronological log of Razorpay payment failures and autonomous AI agent actions
            </p>
          </div>

          {/* Search bar & Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-offwhite-500" />
              <input
                type="text"
                placeholder="Search ID, reasoning, method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-charcoal-800/80 border border-white/[0.08] rounded-lg text-xs text-offwhite-200 placeholder-offwhite-500 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-charcoal-800/60 border border-white/[0.06] rounded-lg overflow-x-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'retry', label: 'Retries' },
                { id: 'nudge', label: 'Nudges' },
                { id: 'escalate', label: 'Escalations' },
                { id: 'recovered', label: 'Recovered' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActionFilter(tab.id)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-all ${
                    actionFilter === tab.id
                      ? 'bg-charcoal-700 text-gold-300 shadow-sm border border-gold-500/25'
                      : 'text-offwhite-500 hover:text-offwhite-200 hover:bg-charcoal-750'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Table Container with scroll */}
      <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead className="sticky top-0 z-10 bg-charcoal-900 border-b border-white/[0.08] text-[11px] font-medium uppercase tracking-wider text-offwhite-500">
            <tr>
              <th className="py-3 px-4 font-semibold">Payment ID</th>
              <th className="py-3 px-4 font-semibold">Amount & Method</th>
              <th className="py-3 px-4 font-semibold">Action Taken</th>
              <th className="py-3 px-4 font-semibold min-w-[280px]">AI Rationale & Reasoning</th>
              <th className="py-3 px-4 font-semibold">Outcome</th>
              <th className="py-3 px-4 font-semibold text-right">Time</th>
              <th className="py-3 px-3 text-center">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-white/[0.05]">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-offwhite-500">
                  <p className="text-sm font-medium text-offwhite-300">No action logs found</p>
                  <p className="text-xs mt-1">Try adjusting your search query or filter tab</p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectRow(item)}
                  className="group hover:bg-charcoal-800/40 hover:border-gold-500/20 cursor-pointer transition-all duration-200"
                >
                  {/* Payment ID with copy button */}
                  <td className="py-3.5 px-4 font-mono text-offwhite-300 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-offwhite-200 group-hover:text-gold-300 transition-colors font-medium">
                        {shortenId(item.paymentId)}
                      </span>
                      <button
                        onClick={(e) => handleCopyId(e, item.paymentId)}
                        className="p-1 rounded text-offwhite-500 hover:text-gold-400 hover:bg-charcoal-700/50 transition-colors"
                        title="Copy full Razorpay ID"
                      >
                        {copiedId === item.paymentId ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                        )}
                      </button>
                    </div>
                    <span className="text-[10px] text-offwhite-500 block mt-0.5">
                      {formatFailureReason(item.failureReason)}
                    </span>
                  </td>

                  {/* Amount & Method */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono text-offwhite-100 font-semibold tabular-nums">
                      {formatINR(item.amountPaise)}
                    </div>
                    <div className="mt-1">
                      {getMethodBadge(item.method)}
                    </div>
                  </td>

                  {/* Action Taken Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getActionBadge(item.actionTaken)}
                    {item.retryCount > 0 && (
                      <span className="text-[10px] font-mono text-offwhite-500 block mt-1">
                        Attempt #{item.retryCount}
                      </span>
                    )}
                  </td>

                  {/* AI Reasoning Text with visual quote mark */}
                  <td className="py-3.5 px-4 text-offwhite-300">
                    <p className="line-clamp-2 text-xs leading-relaxed text-offwhite-300/90 group-hover:text-offwhite-100 transition-colors">
                      {item.reasoning}
                    </p>
                    <span className="text-[10px] text-gold-500/80 hover:underline mt-0.5 inline-block">
                      Click to inspect decision trace →
                    </span>
                  </td>

                  {/* Outcome */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getOutcomeBadge(item.outcome)}
                  </td>

                  {/* Time */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-[11px] text-offwhite-500">
                    {formatRelativeTime(item.timestamp)}
                  </td>

                  {/* Arrow Action */}
                  <td className="py-3.5 px-3 text-center">
                    <ChevronRight className="w-4 h-4 text-offwhite-600 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 px-5 border-t border-white/[0.06] bg-charcoal-900/80 flex items-center justify-between text-[11px] text-offwhite-500">
        <span>Displaying latest autonomous recovery interventions</span>
        <span className="text-offwhite-400 font-mono">
          Sorted by most recent
        </span>
      </div>

    </div>
  );
};
