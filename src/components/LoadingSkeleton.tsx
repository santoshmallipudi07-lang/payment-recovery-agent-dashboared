import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="fintech-card rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-white/[0.06] rounded" />
              <div className="h-6 w-6 bg-white/[0.06] rounded-lg" />
            </div>
            <div className="h-8 w-28 bg-white/[0.08] rounded my-2" />
            <div className="pt-2 border-t border-white/[0.04] flex justify-between">
              <div className="h-2.5 w-32 bg-white/[0.04] rounded" />
              <div className="h-4 w-12 bg-white/[0.04] rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 fintech-card rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <div className="h-4 w-36 bg-white/[0.07] rounded" />
              <div className="h-2.5 w-48 bg-white/[0.04] rounded" />
            </div>
            <div className="h-6 w-24 bg-white/[0.06] rounded-md" />
          </div>
          <div className="h-48 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-4 border-white/[0.06] border-t-gold-500/20" />
          </div>
        </div>

        <div className="lg:col-span-6 fintech-card rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <div className="h-4 w-40 bg-white/[0.07] rounded" />
              <div className="h-2.5 w-52 bg-white/[0.04] rounded" />
            </div>
            <div className="h-5 w-20 bg-white/[0.06] rounded" />
          </div>
          <div className="space-y-4 pt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-28 bg-white/[0.06] rounded" />
                  <div className="h-3 w-20 bg-white/[0.06] rounded" />
                </div>
                <div className="h-1.5 w-full bg-white/[0.04] rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="fintech-card rounded-xl overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/[0.06]">
          <div className="space-y-1.5">
            <div className="h-4 w-48 bg-white/[0.07] rounded" />
            <div className="h-2.5 w-64 bg-white/[0.04] rounded" />
          </div>
          <div className="h-8 w-44 bg-white/[0.06] rounded-lg" />
        </div>

        <div className="space-y-3 pt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-charcoal-800/30 border border-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="h-3 w-24 bg-white/[0.06] rounded" />
                <div className="h-3 w-16 bg-white/[0.04] rounded" />
              </div>
              <div className="h-3 w-64 bg-white/[0.05] rounded hidden md:block" />
              <div className="h-5 w-20 bg-white/[0.06] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
