import type { CurrencyCode } from '@/lib/supabase/database.types'
import type { FxRate } from '@/lib/types/api'

export const FX_RATES: FxRate[] = [
  { fromCurrency: 'EUR', toCurrency: 'CZK', rate: 25.2 },
  { fromCurrency: 'CZK', toCurrency: 'EUR', rate: 0.0397 },
  { fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.08 },
  { fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.926 },
  { fromCurrency: 'CZK', toCurrency: 'USD', rate: 0.0429 },
  { fromCurrency: 'USD', toCurrency: 'CZK', rate: 23.3 },
  { fromCurrency: 'GBP', toCurrency: 'EUR', rate: 1.175 },
  { fromCurrency: 'EUR', toCurrency: 'GBP', rate: 0.851 },
  { fromCurrency: 'GBP', toCurrency: 'USD', rate: 1.27 },
  { fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.787 },
  { fromCurrency: 'GBP', toCurrency: 'CZK', rate: 29.6 },
  { fromCurrency: 'CZK', toCurrency: 'GBP', rate: 0.0338 },
]

export function lookupFxRate(from: CurrencyCode, to: CurrencyCode): number | null {
  const entry = FX_RATES.find((r) => r.fromCurrency === from && r.toCurrency === to)
  return entry?.rate ?? null
}
