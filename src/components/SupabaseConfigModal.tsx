import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Globe, 
  RotateCw, 
  Trash2,
  Copy,
  Check,
  HelpCircle,
  UploadCloud
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials, 
  testConnection,
  normalizeSupabaseUrl,
  type TestResult
} from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
  onSwitchToMock: () => void;
  isUsingMockData: boolean;
  onSeedSampleData?: () => Promise<{ success: boolean; message: string }>;
  isSeeding?: boolean;
}

const SQL_SETUP_SCRIPT = `-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS failed_payments (
  id TEXT PRIMARY KEY,
  amount BIGINT NOT NULL,
  method TEXT NOT NULL,
  failure_reason TEXT NOT NULL,
  retry_count INT DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('open', 'recovered', 'escalated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_email TEXT,
  customer_name TEXT
);

CREATE TABLE IF NOT EXISTS action_log (
  id BIGSERIAL PRIMARY KEY,
  failed_payment_id TEXT REFERENCES failed_payments(id) ON DELETE CASCADE,
  action_taken TEXT NOT NULL CHECK (action_taken IN ('retry', 'nudge', 'escalate')),
  reasoning TEXT NOT NULL,
  outcome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public anonymous read/write access:
ALTER TABLE failed_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read failed_payments" ON failed_payments FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert failed_payments" ON failed_payments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update failed_payments" ON failed_payments FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon read action_log" ON action_log FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert action_log" ON action_log FOR INSERT TO anon WITH CHECK (true);
`;

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
  onSwitchToMock,
  isUsingMockData,
  onSeedSampleData,
  isSeeding = false,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      setTestResult(null);
      setSeedStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    const cleanUrl = normalizeSupabaseUrl(url);
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      setTestResult({ 
        success: false, 
        message: 'Please enter both Supabase Project URL and Anon Key.' 
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const res = await testConnection(cleanUrl, cleanKey);
    setTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    const cleanUrl = normalizeSupabaseUrl(url);
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      setTestResult({ 
        success: false, 
        message: 'Both URL and Anon Key are required to connect.' 
      });
      return;
    }

    saveSupabaseCredentials(cleanUrl, cleanKey);
    onConfigSaved();
    onClose();
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onSwitchToMock();
    onClose();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2200);
  };

  const handleSeed = async () => {
    if (!onSeedSampleData) return;
    setSeedStatus('Inserting sample records into your Supabase database...');
    const res = await onSeedSampleData();
    setSeedStatus(res.message);
    if (res.success) {
      // Re-test to update row counts
      handleTest();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-charcoal-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-charcoal-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-charcoal-800 border border-gold-500/30 text-gold-400 shadow-gold-glow">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-offwhite-100 tracking-tight">
                Connect Supabase Database
              </h3>
              <p className="text-xs text-offwhite-500">
                Live failed payments & AI action log integration
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

        {/* Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          
          {/* Status banner */}
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            isUsingMockData 
              ? 'bg-amber-950/30 border-gold-500/30 text-gold-300'
              : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isUsingMockData ? 'bg-gold-400' : 'bg-emerald-400'}`} />
              <span>
                Active Mode: <strong>{isUsingMockData ? 'Demo Dataset (Offline)' : 'Connected to Supabase'}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                if (isUsingMockData) {
                  handleTest();
                } else {
                  onSwitchToMock();
                  onClose();
                }
              }}
              className="text-[11px] underline hover:text-offwhite-100 font-medium"
            >
              {isUsingMockData ? 'Switch to Live' : 'Use Demo Mode'}
            </button>
          </div>

          {/* Project URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-offwhite-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-offwhite-500" />
                Project URL
              </label>
              <span className="text-[10px] text-offwhite-500 font-mono">
                e.g. https://xxxx.supabase.co
              </span>
            </div>
            <input
              type="text"
              placeholder="https://your-project-id.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-charcoal-800 border border-white/10 rounded-xl text-xs font-mono text-offwhite-100 placeholder-offwhite-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
            />
          </div>

          {/* Anon Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-offwhite-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-offwhite-500" />
                Anon Public Key
              </label>
              <span className="text-[10px] text-offwhite-500 font-mono">
                Project Settings → API → `anon` public
              </span>
            </div>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3.5 py-2 bg-charcoal-800 border border-white/10 rounded-xl text-xs font-mono text-offwhite-100 placeholder-offwhite-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
            />
          </div>

          {/* Test connection result diagnostics */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
              testResult.success 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}>
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">{testResult.message}</p>
                  
                  {testResult.tableDetails && (
                    <div className="font-mono text-[11px] opacity-90 space-y-0.5 pt-1">
                      <div>
                        ✓ Table <strong>{testResult.tableDetails.failedPaymentsTable}</strong>: {testResult.tableDetails.failedPaymentsCount} rows
                      </div>
                      <div>
                        ✓ Table <strong>{testResult.tableDetails.actionLogsTable}</strong>: {testResult.tableDetails.actionLogsCount} rows
                      </div>
                    </div>
                  )}

                  {testResult.helpHint && (
                    <p className="text-[11px] text-amber-300/90 pt-1 font-sans">
                      💡 {testResult.helpHint}
                    </p>
                  )}
                </div>
              </div>

              {/* If connected but 0 rows, offer sample data seed button */}
              {testResult.success && testResult.tableDetails && testResult.tableDetails.failedPaymentsCount === 0 && onSeedSampleData && (
                <div className="pt-2 border-t border-emerald-500/20">
                  <button
                    onClick={handleSeed}
                    disabled={isSeeding}
                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isSeeding ? 'Populating Database...' : 'Populate 12 Sample Recovery Records into Supabase'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Seeding feedback */}
          {seedStatus && (
            <div className="p-2.5 rounded-lg bg-charcoal-800 border border-white/10 text-xs text-offwhite-200 font-mono">
              {seedStatus}
            </div>
          )}

          {/* Quick SQL Schema Accordion / Helper */}
          <div className="p-3 rounded-xl bg-charcoal-850 border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-offwhite-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-gold-400" /> Need to create tables in Supabase?
              </span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 text-[11px] text-gold-400 hover:text-gold-300 font-medium transition-colors"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <p className="text-[11px] text-offwhite-500 leading-relaxed">
              Paste the script into your <strong>Supabase Project → SQL Editor</strong> to create <code className="text-gold-300">failed_payments</code> & <code className="text-gold-300">action_log</code> tables with public read/write RLS policies.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-charcoal-850 flex items-center justify-between gap-3">
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-offwhite-500 hover:text-red-400 transition-colors"
            title="Reset to default demo data"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-charcoal-750 hover:bg-charcoal-700 text-offwhite-200 border border-white/10 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {testing ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Test Connection</span>
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-semibold shadow-gold-glow transition-all"
            >
              Save & Apply
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
