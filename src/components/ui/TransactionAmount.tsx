import { formatMoney } from '@/lib/formatters'
import type { CurrencyCode, TransactionDirection } from '@/lib/supabase/database.types'

type TransactionAmountProps = {
  amountMinor: number
  currency: CurrencyCode
  direction: TransactionDirection
  size?: 'default' | 'large'
  align?: 'left' | 'right'
}

function getSignedAmountLabel(
  amountMinor: number,
  currency: CurrencyCode,
  direction: TransactionDirection,
) {
  const sign = direction === 'incoming' ? '+' : '-'
  return `${sign}${formatMoney(amountMinor, currency)}`
}

export function TransactionAmount({
  amountMinor,
  currency,
  direction,
  size = 'default',
  align = 'left',
}: TransactionAmountProps) {
  return (
    <p
      className={[
        size === 'large' ? 'text-2xl' : 'text-base',
        align === 'right' ? 'text-right' : 'text-left',
        'font-semibold tracking-tight',
        direction === 'incoming' ? 'text-emerald-700' : 'text-red-600',
      ].join(' ')}>
      {getSignedAmountLabel(amountMinor, currency, direction)}
    </p>
  )
}
