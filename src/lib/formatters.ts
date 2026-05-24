import type { CurrencyCode } from '@/lib/supabase/database.types'

export function formatMoney(amountMinor: number, currency: CurrencyCode) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100)
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatMaskedReference(value: string | null | undefined) {
  if (!value) {
    return 'Not available'
  }

  if (value.length <= 4) {
    return value
  }

  return `••••${value.slice(-4)}`
}
