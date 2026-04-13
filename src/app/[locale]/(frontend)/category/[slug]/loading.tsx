import React from 'react'

export default function CategoryLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Category Header Skeleton */}
      <div 
        className="w-full py-16 sm:py-24" 
        style={{ 
          background: 'linear-gradient(to bottom, var(--bg-surface) 0%, var(--bg-primary) 100%)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
          <div className="w-48 h-10 skeleton mb-4" />
          <div className="w-96 h-4 skeleton mb-2" />
          <div className="w-64 h-4 skeleton" />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
        {/* Filters/Tabs Skeleton */}
        <div className="flex gap-4 mb-10 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-24 h-5 skeleton rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Articles Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[16/10] w-full skeleton rounded-xl" />
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-16 h-3 skeleton rounded-full" />
                  <div className="w-16 h-3 skeleton rounded-full" />
                </div>
                <div className="w-full h-6 skeleton" />
                <div className="w-3/4 h-6 skeleton" />
                <div className="w-full h-3 skeleton mt-4" />
                <div className="w-24 h-3 skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
