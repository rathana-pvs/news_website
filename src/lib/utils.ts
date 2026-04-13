import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { enUS, km } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string, pattern = 'MMMM d, yyyy', localeCode = 'en'): string {
  try {
    const date = parseISO(dateString)
    const locale = localeCode === 'km' ? km : enUS
    
    // For Khmer, we typically prefer d MMMM yyyy format if it's a standard date display
    let finalPattern = pattern
    if (localeCode === 'km' && (pattern === 'MMMM d, yyyy' || pattern === 'MMM d, yyyy')) {
      finalPattern = 'd MMMM yyyy'
    }

    return format(date, finalPattern, { locale })
  } catch {
    return dateString
  }
}

export function formatRelativeDate(dateString: string, localeCode = 'en'): string {
  try {
    const locale = localeCode === 'km' ? km : enUS
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale })
  } catch {
    return dateString
  }
}

export function calcReadTime(text: string): number {
  const wordCount = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

export function truncate(str: string | undefined | null, maxLength: number): string {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trim() + '…'
}

export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
