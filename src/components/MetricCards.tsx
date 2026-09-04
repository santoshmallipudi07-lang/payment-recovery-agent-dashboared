import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle2, 
  UserX, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import type { RecoveryMetrics } from '../types/database';
import { formatRupees } from '../lib/formatters';

interface MetricCardsProps {
  metrics: RecoveryMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const cards = [
    {
      id: 'at-risk',
      label: 'Total Amount At Risk',
      value: formatRupees(metrics.totalAtRiskINR),
      subtext: `From ${metrics.totalCount} failed transactions`,
      icon: AlertTriangle,
      accentColor: 'text-offwhite-200',
      valueColor: 'text-offwhite-100',
      badge: null,
      glow: false,
    },
    {
      id: 'recovered',
      label: 'Total Recovered',
      value: formatRupees(metrics.totalRecoveredINR),
      subtext: `${metrics.recoveredCount} payments saved autonomously`,
      icon: CheckCircle2,
      accentColor: 'text-emerald-400',
      valueColor: 'text-emerald-300',
      badge: {
        text: 'Autonomous Win',
        bg: 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20',
      },
      glow: false,
    },
    {
      id: 'recovery-rate',
      label: 'Recovery Rate %',
      value: `${metrics.recoveryRatePercent}%`,
      subtext: `${formatRupees(metrics.totalRecoveredINR)} / ${formatRupees(metrics.totalAtRiskINR)}`,
      icon: TrendingUp,
      accentColor: 'text-gold-400',
      valueColor: 'text-gold-400 font-bold',
      badge: {
        text: 'Target: >70%',
        bg: 'bg-gold-900/40 text-gold-300 border border-gold-500/30',
      },
      glow: true, // Special gold emphasis as requested
    },
    {
      id: 'escalated',
      label: 'Escalated to Human',
      value: metrics.escalatedCount.toString(),
      subtext: `${formatRupees(metrics.escalatedAmountINR)} queued for ops desk`,
      icon: UserX,
      accentColor: 'text-fintech-red',
      valueColor: 'text-fintech-red',
      badge: {
        text: 'Human Handoff',
        bg: 'bg-red-950/40 text-red-400 border border-red-500/20',
      },
      glow: false,
    },
    {
      id: 'open',
      label: 'Still Open in Pipeline',
      value: metrics.stillOpenCount.toString(),
      subtext: `${formatRupees(metrics.stillOpenAmountINR)} in retry/nudge stage`,
      icon: Clock,
      accentColor: 'text-fintech-blue',
      valueColor: 'text-fintech-blue',
      badge: {
        text: 'In Flight',
        bg: 'bg-blue-950/40 text-blue-400 border border-blue-500/20',
      },
      glow: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.55,
              delay: index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`group relative rounded-xl p-5 fintech-card fintech-card-hover ${
              card.glow ? 'border-gold-500/30 shadow-gold-glow bg-gradient-to-b from-charcoal-850 to-charcoal-900' : ''
            }`}
          >
            {/* Top label & icon */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-offwhite-500">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg bg-charcoal-800/80 border border-white/[0.06] ${card.accentColor} group-hover:scale-105 transition-transform duration-200`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Large Bold Numeral */}
            <div className="flex items-baseline gap-1 my-1">
              <span className={`text-2xl lg:text-3xl font-semibold tracking-tight font-mono tabular-nums ${card.valueColor}`}>
                {card.value}
              </span>
            </div>

            {/* Subtext and mini badge */}
            <div className="mt-2.5 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-xs">
              <span className="text-offwhite-500 truncate text-[11px]">
                {card.subtext}
              </span>
              {card.badge && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${card.badge.bg}`}>
                  {card.badge.text}
                </span>
              )}
            </div>

            {/* Subtle highlight corner line on gold card */}
            {card.glow && (
              <div className="absolute top-0 right-6 h-[1px] w-12 bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
