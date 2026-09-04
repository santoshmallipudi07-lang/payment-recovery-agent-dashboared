import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RotateCw, 
  Database, 
  SlidersHorizontal 
} from 'lucide-react';

interface HeaderProps {
  isUsingMockData: boolean;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenConfig: () => void;
  isRealtimeConnected?: boolean;
  realtimeEventsCount?: number;
  activeTable?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isUsingMockData,
  onRefresh,
  isLoading,
  onOpenConfig,
  isRealtimeConnected = false,
  realtimeEventsCount = 0,
  activeTable = 'audit_logs',
}) => {
  const [timeString, setTimeString] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-IN', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={`sticky top-0 z-30 w-full px-4 sm:px-6 lg:px-8 py-3.5 transition-all duration-300 ${
      isScrolled 
        ? 'bg-charcoal-950/90 backdrop-blur-xl border-b border-gold-500/25 shadow-xl shadow-black/50 py-3' 
        : 'fintech-glass border-b border-white/[0.07] py-3.5'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left: Brand & Agent Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-charcoal-800 border border-gold-500/30 text-gold-500 shadow-gold-glow">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-semibold tracking-tight text-offwhite-100 flex items-center gap-2">
                Payment Recovery Agent
              </h1>
              
              {/* Agent Active Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>AGENT ACTIVE</span>
              </div>

              {/* Data source badge */}
              <button 
                onClick={onOpenConfig}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide transition-all border ${
                  isUsingMockData
                    ? 'bg-amber-950/40 border-gold-500/30 text-gold-300 hover:border-gold-400/60'
                    : 'bg-charcoal-800 border-white/10 text-offwhite-300 hover:border-white/20'
                }`}
                title="Click to configure Supabase credentials"
              >
                <span>{isUsingMockData ? 'Demo Dataset' : 'Live Supabase'}</span>
                <SlidersHorizontal className="w-2.5 h-2.5 opacity-60 ml-0.5" />
              </button>

              {/* Realtime Live Pill */}
              {!isUsingMockData && (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide border transition-all ${
                  isRealtimeConnected 
                    ? 'bg-gold-950/40 border-gold-500/40 text-gold-300' 
                    : 'bg-charcoal-800 border-white/10 text-offwhite-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-gold-400 animate-ping' : 'bg-offwhite-600'}`} />
                  <span>{isRealtimeConnected ? `LIVE: ${activeTable}` : 'CONNECTING REALTIME...'}</span>
                  {realtimeEventsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-gold-500/30 text-gold-200">
                      +{realtimeEventsCount} new
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-xs text-offwhite-500 tracking-wide mt-0.5">
              Autonomous Razorpay Failure Resolution • Smart Retry, Nudge & Escalation
            </p>
          </div>
        </div>

        {/* Right: Real-time clock & Action Controls */}
        <div className="flex items-center gap-3 self-end md:self-center">
          {/* Real-time Clock */}
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[11px] uppercase tracking-wider text-offwhite-500 font-medium">
              System Time
            </span>
            <span className="font-mono text-xs text-offwhite-300 tracking-tight">
              {timeString || 'Syncing...'}
            </span>
          </div>

          <div className="h-6 w-px bg-white/[0.08] hidden sm:block" />

          {/* Connect / Config button */}
          <button
            onClick={onOpenConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-offwhite-300 bg-charcoal-800/80 hover:bg-charcoal-700/80 border border-white/[0.08] hover:border-gold-500/40 hover:text-offwhite-100 transition-all duration-200"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-gold-400" />
            <span className="hidden xs:inline">Supabase</span> Config
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-offwhite-200 bg-charcoal-800/90 hover:bg-charcoal-700 border border-white/[0.08] hover:border-gold-500/40 transition-all duration-200 disabled:opacity-50"
            title="Refresh failed payments & action logs"
          >
            <RotateCw className={`w-3.5 h-3.5 text-gold-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

      </div>
    </header>
  );
};
