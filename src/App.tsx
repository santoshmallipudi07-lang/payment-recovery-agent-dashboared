import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRecoveryData } from './hooks/useRecoveryData';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { AnalyticsSection } from './components/AnalyticsSection';
import { AuditTrailTable } from './components/AuditTrailTable';
import { DecisionDetailModal } from './components/DecisionDetailModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import type { AuditTrailItem } from './types/database';
import { 
  AlertCircle, 
  SlidersHorizontal 
} from 'lucide-react';

export function App() {
  const {
    auditTrail,
    metrics,
    actionBreakdown,
    failureReasonBreakdown,
    loading,
    error,
    isUsingMockData,
    isSeeding,
    refresh,
    switchDataSource,
    seedSampleDataToSupabase,
  } = useRecoveryData();

  const [selectedAuditItem, setSelectedAuditItem] = useState<AuditTrailItem | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-charcoal-950 text-offwhite-200 selection:bg-gold-500/20 selection:text-gold-300 relative pb-16">
      
      {/* Ambient background glow (restrained, private banking feel) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[340px] bg-gradient-to-b from-gold-500/[0.035] via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Header Navigation */}
      <Header
        isUsingMockData={isUsingMockData}
        onRefresh={refresh}
        isLoading={loading}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        {/* Error notification banner if Supabase fails */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-amber-950/30 border border-gold-500/30 text-xs text-gold-300 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-gold-400 shrink-0" />
              <span>
                <strong>Notice:</strong> {error} Displaying high-fidelity demo dataset.
              </span>
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="underline hover:text-offwhite-100 font-medium shrink-0"
            >
              Configure Credentials
            </button>
          </motion.div>
        )}

        {/* Demo Mode banner hint */}
        {isUsingMockData && !error && (
          <div className="p-3 px-4 rounded-xl bg-charcoal-900/60 border border-white/[0.06] text-xs text-offwhite-400 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
              <span>
                Running in <strong>High-Fidelity Demo Mode</strong>. Ready for hackathon presentation.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsConfigOpen(true)}
                className="text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1 font-medium"
              >
                <SlidersHorizontal className="w-3 h-3" /> Connect Supabase Tables
              </button>
            </div>
          </div>
        )}

        {loading ? (
          /* Calm Loading Skeleton */
          <LoadingSkeleton />
        ) : (
          <>
            {/* SECTION 1: METRIC CARDS ROW */}
            <motion.section
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-gold-400 font-semibold">
                    01
                  </span>
                  <span className="text-offwhite-500">/</span>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-offwhite-400">
                    Recovery Performance
                  </span>
                </div>
                <span className="text-[11px] text-offwhite-500 font-mono hidden sm:inline">
                  Auto-synced with Razorpay Webhooks
                </span>
              </div>

              <MetricCards metrics={metrics} />
            </motion.section>

            {/* SECTION 2: CHARTS & ANALYTICS BREAKDOWN */}
            <motion.section
              initial={{ opacity: 0, y: 52 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -130px 0px", amount: 0.2 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3 pt-4"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-gold-400 font-semibold">
                    02
                  </span>
                  <span className="text-offwhite-500">/</span>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-offwhite-400">
                    Autonomous Intelligence & Root Causes
                  </span>
                </div>
                <span className="text-[11px] text-offwhite-500 font-mono hidden sm:inline">
                  Decisions: Retry vs Nudge vs Escalate
                </span>
              </div>

              <AnalyticsSection
                actionBreakdown={actionBreakdown}
                failureReasons={failureReasonBreakdown}
              />
            </motion.section>

            {/* SECTION 3: AUDIT TRAIL ACTION LOG */}
            <motion.section
              initial={{ opacity: 0, y: 52 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -130px 0px", amount: 0.15 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3 pt-4"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-gold-400 font-semibold">
                    03
                  </span>
                  <span className="text-offwhite-500">/</span>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-offwhite-400">
                    Live Audit Trail & AI Decision Log
                  </span>
                </div>
                <span className="text-[11px] text-offwhite-500 font-mono hidden sm:inline">
                  Chronological action stream
                </span>
              </div>

              <AuditTrailTable
                items={auditTrail}
                onSelectRow={(item) => setSelectedAuditItem(item)}
              />
            </motion.section>
          </>
        )}

        {/* Footer */}
        <footer className="pt-8 pb-4 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-offwhite-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Payment Recovery Agent • Autonomous Razorpay Failover Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Powered by Supabase & Next-Gen Agent Heuristics</span>
          </div>
        </footer>

      </main>

      {/* Decision Detail Modal */}
      <DecisionDetailModal
        item={selectedAuditItem}
        onClose={() => setSelectedAuditItem(null)}
      />

      {/* Supabase Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigSaved={() => {
          refresh();
        }}
        onSwitchToMock={() => switchDataSource(true)}
        isUsingMockData={isUsingMockData}
        onSeedSampleData={seedSampleDataToSupabase}
        isSeeding={isSeeding}
      />

    </div>
  );
}

export default App;
