'use client'

import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  name: string
  color?: string
  size?: 'sm' | 'md'
  className?: string
}

export function CategoryBadge({ name, color = '#c9a84c', size = 'md', className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'label-caps inline-flex items-center rounded-sm font-semibold',
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm',
        className,
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {name}
    </span>
  )
}
