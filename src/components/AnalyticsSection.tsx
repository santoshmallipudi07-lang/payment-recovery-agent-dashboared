import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ActionDistribution, FailureReasonDistribution } from '../types/database';
import { formatRupees } from '../lib/formatters';
import { PieChart as PieIcon, BarChart3, ArrowUpRight } from 'lucide-react';

interface AnalyticsSectionProps {
  actionBreakdown: ActionDistribution[];
  failureReasons: FailureReasonDistribution[];
}

// Custom Tooltip for Recharts Donut
const CustomDonutTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ActionDistribution;
    return (
      <div className="bg-charcoal-850/95 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl text-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <span className="font-semibold text-offwhite-100">{data.name}</span>
        </div>
        <div className="space-y-1 text-offwhite-400 font-mono">
          <div className="flex justify-between gap-4">
            <span>Decisions:</span>
            <span className="text-offwhite-200 font-medium">{data.count} ({data.percentage}%)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Recovered:</span>
            <span className="text-emerald-400 font-medium">{data.recoveredCount}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Success Rate:</span>
            <span className="text-gold-400 font-medium">
              {data.count > 0 ? Math.round((data.recoveredCount / data.count) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  actionBreakdown,
  failureReasons,
}) => {
  const totalDecisions = actionBreakdown.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      {/* Left Panel: Donut Chart - Actions Breakdown */}
      <div className="lg:col-span-6 fintech-card rounded-xl p-5 sm:p-6 fintech-card-hover flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-charcoal-800 border border-white/[0.06] text-gold-400">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-offwhite-100 tracking-tight">
                  AI Decision Breakdown
                </h3>
                <p className="text-[11px] text-offwhite-500">
                  Distribution of automated recovery pathways
                </p>
              </div>
            </div>

            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-charcoal-800/80 border border-white/[0.08] text-offwhite-300">
              {totalDecisions} Actions Logged
            </span>
          </div>

          {/* Chart & Legend Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-2">
            {/* Donut Chart with Center Text */}
            <div className="sm:col-span-6 relative h-[210px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actionBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="count"
                    stroke="#0b0c0e"
                    strokeWidth={2}
                  >
                    {actionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomDonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-wider text-offwhite-500 font-semibold">
                  Total
                </span>
                <span className="text-xl font-bold font-mono text-offwhite-100">
                  {totalDecisions}
                </span>
                <span className="text-[10px] text-gold-400/90 font-medium">
                  Decisions
                </span>
              </div>
            </div>

            {/* Action Legend & Conversion Stats */}
            <div className="sm:col-span-6 space-y-2.5">
              {actionBreakdown.map((item) => (
                <div
                  key={item.name}
                  className="p-2.5 rounded-lg bg-charcoal-800/50 border border-white/[0.05] hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-offwhite-200">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono text-offwhite-100 font-semibold">
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-offwhite-500 pt-1 border-t border-white/[0.04]">
                    <span>{item.count} dispatched</span>
                    <span className="text-emerald-400 font-mono">
                      {item.recoveredCount} recovered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Insight */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-offwhite-500">
          <span>AI Autonomous Handled: <strong>{actionBreakdown[0].percentage + actionBreakdown[1].percentage}%</strong></span>
          <span className="text-gold-400/90 flex items-center gap-1">
            Zero Human Burden <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Right Panel: Top Failure Reasons & Recovery Efficacy */}
      <div className="lg:col-span-6 fintech-card rounded-xl p-5 sm:p-6 fintech-card-hover flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-charcoal-800 border border-white/[0.06] text-gold-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-offwhite-100 tracking-tight">
                  Failure Reason Resolution
                </h3>
                <p className="text-[11px] text-offwhite-500">
                  Transaction volume and recovery rate per root cause
                </p>
              </div>
            </div>

            <span className="text-xs text-offwhite-400 font-mono">
              Root Causes
            </span>
          </div>

          {/* List of Failure Reasons with sleek progress bars */}
          <div className="space-y-3 py-1">
            {failureReasons.slice(0, 4).map((item) => (
              <div key={item.reason} className="group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-offwhite-200 font-medium truncate max-w-[200px] sm:max-w-xs">
                    {item.displayName}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-offwhite-400">
                      {formatRupees(item.amountINR)}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      item.recoveredPercent >= 60 
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/20'
                        : item.recoveredPercent >= 30
                        ? 'bg-gold-950/40 text-gold-300 border border-gold-500/20'
                        : 'bg-red-950/40 text-red-300 border border-red-500/20'
                    }`}>
                      {item.recoveredPercent}% recovered
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-charcoal-800 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(item.recoveredPercent, 6)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Insight */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-offwhite-500">
          <span>Highest Recovery: <strong>Gateway Technical Errors (100%)</strong></span>
          <span className="text-offwhite-400 font-mono">
            Razorpay Webhook Hooked
          </span>
        </div>

      </div>

    </div>
  );
};
