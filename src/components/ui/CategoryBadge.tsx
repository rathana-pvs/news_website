'use client'

import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  name: string
  color?: string
  size?: 'sm' | 'md'
  className?: string
}

export function CategoryBadge({ name, size = 'md', className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-sans font-semibold',
        size === 'sm' ? 'text-[12px]' : 'text-[13px]',
        className,
      )}
      style={{ color: 'var(--accent-red)' }}
    >
      {name}
    </span>
  )
}
