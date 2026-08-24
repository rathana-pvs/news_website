import React from 'react'

export default function ArticleLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Article Container Skeleton */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-3 sm:pt-6 pb-6 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-8">
            {/* Category & Badge Skeleton */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-20 h-6 skeleton rounded-full" />
            </div>

            {/* Title Skeleton */}
            <div className="w-full h-10 skeleton mb-2 rounded-md" />
            <div className="w-3/4 h-10 skeleton mb-4 rounded-md" />

            {/* Author Chip Skeleton */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full skeleton" />
              <div className="flex flex-col gap-2">
                <div className="w-28 h-4 skeleton" />
                <div className="w-20 h-3 skeleton" />
              </div>
            </div>

            {/* Cover Image Skeleton */}
            <div className="relative w-full aspect-video max-h-[190px] sm:max-h-none rounded-xl overflow-hidden mb-6 skeleton" />

            {/* Excerpt Skeleton */}
            <div className="mb-6 border-l-4 pl-4 pr-4 py-3 rounded-r-lg skeleton h-20" style={{ borderColor: 'var(--accent-red)' }} />

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
            <div className="sticky top-24 space-y-4">
              <div className="w-32 h-4 skeleton mb-4" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2 pb-4 border-b border-[var(--border)]">
                  <div className="w-full aspect-video skeleton rounded" />
                  <div className="w-full h-4 skeleton" />
                  <div className="w-2/3 h-3 skeleton" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
