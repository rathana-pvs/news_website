import React from 'react'

export default function RegionLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Region Header Skeleton */}
      <div 
        className="w-full py-16" 
        style={{ 
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px]" style={{ background: 'var(--accent-gold)' }} />
            <div className="w-48 h-4 skeleton" />
          </div>
          <div className="w-96 h-12 skeleton mb-6" />
          <div className="w-[600px] h-4 skeleton" />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Main Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-video w-full skeleton rounded-xl" />
                  <div className="space-y-2">
                    <div className="w-full h-6 skeleton" />
                    <div className="w-2/3 h-6 skeleton" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="p-6 rounded-xl border border-dashed border-border space-y-4">
              <div className="w-32 h-4 skeleton" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-16 h-12 skeleton rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="w-full h-3 skeleton" />
                      <div className="w-2/3 h-3 skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
