import React from 'react'

export default function ArticleLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Image Skeleton */}
      <div className="relative w-full overflow-hidden" style={{ height: '60vh', minHeight: 400, maxHeight: 700, background: 'var(--bg-card)' }}>
        <div className="absolute inset-0 skeleton" />
        
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(13,17,23,0.2) 0%, rgba(13,17,23,0.97) 85%)' }}
        />

        {/* Overlay content skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-[900px] mx-auto">
          <div className="flex gap-2 mb-4">
            <div className="w-24 h-6 skeleton rounded-full" />
          </div>
          <div className="w-full h-12 skeleton mb-4" />
          <div className="w-3/4 h-12 skeleton" />
        </div>
      </div>

      {/* Article Container Skeleton */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-8">
            {/* Author + Meta Skeleton */}
            <div
              className="flex flex-wrap items-center gap-4 pb-6 mb-8"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full skeleton" />
                <div className="flex flex-col gap-2">
                  <div className="w-24 h-4 skeleton" />
                  <div className="w-16 h-3 skeleton" />
                </div>
              </div>
            </div>

            {/* Excerpt Skeleton */}
            <div className="mb-8 border-l-4 p-5 flex flex-col gap-3" style={{ borderColor: 'var(--accent-gold)' }}>
              <div className="w-full h-5 skeleton" />
              <div className="w-full h-5 skeleton" />
              <div className="w-2/3 h-5 skeleton" />
            </div>

            {/* Content Body Skeleton */}
            <div className="flex flex-col gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="w-full h-4 skeleton" />
                  <div className="w-full h-4 skeleton" />
                  <div className="w-full h-4 skeleton" />
                  <div className="w-5/6 h-4 skeleton" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-6">
              <div
                className="p-6 rounded-xl space-y-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="w-20 h-3 skeleton" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full h-10 skeleton rounded-lg" />
                  ))}
                </div>
              </div>

              <div
                className="p-6 rounded-xl space-y-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="w-24 h-3 skeleton" />
                <div className="space-y-4">
                  <div className="w-full h-8 skeleton" />
                  <div className="w-full h-8 skeleton" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
