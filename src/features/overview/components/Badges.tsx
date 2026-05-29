import { Badge } from '@/components/ui/Badge'
import type {
  AccountType,
  AccountVerificationStatus,
  CounterpartyType,
  CurrencyCode,
  PaymentContactStatus,
  TransactionDirection,
  TransactionStatus,
  TransactionType,
  UserRole,
  WalletStatus,
} from '@/lib/supabase/database.types'

function formatLabel(value: string) {
  return value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export function CurrencyPill({
  currency,
  isPrimary = false,
}: {
  currency: CurrencyCode
  isPrimary?: boolean
}) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.12em]',
        isPrimary ? 'bg-orange-100 text-orange-700' : 'bg-zinc-100 text-zinc-600',
      ].join(' ')}>
      {currency}
    </span>
  )
}

export function AccountVerificationBadge({ status }: { status: AccountVerificationStatus }) {
  const tone =
    status === 'verified' ? 'positive' : status === 'pending_review' ? 'warning' : 'critical'

  return <Badge tone={tone}>{formatLabel(status)}</Badge>
}

export function AccountTypeBadge({ type }: { type: AccountType }) {
  return <Badge tone={type === 'business' ? 'accent' : 'muted'}>{formatLabel(type)}</Badge>
}

export function WalletStatusBadge({ status }: { status: WalletStatus }) {
  const tone = status === 'active' ? 'positive' : status === 'limited' ? 'warning' : 'critical'
  return <Badge tone={tone}>{formatLabel(status)}</Badge>
}

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const tone =
    status === 'completed'
      ? 'positive'
      : status === 'pending' || status === 'requires_review'
        ? 'warning'
        : 'critical'

  return <Badge tone={tone}>{formatLabel(status)}</Badge>
}

export function TransactionDirectionBadge({ direction }: { direction: TransactionDirection }) {
  return (
    <Badge tone={direction === 'incoming' ? 'positive' : 'accent'}>{formatLabel(direction)}</Badge>
  )
}

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const tone = type === 'fee' ? 'critical' : type === 'fx_conversion' ? 'warning' : 'accent'
  return <Badge tone={tone}>{formatLabel(type)}</Badge>
}

export function CounterpartyTypeBadge({ type }: { type: CounterpartyType }) {
  const tone = type === 'platform' ? 'muted' : type === 'fx' ? 'warning' : 'neutral'
  return <Badge tone={tone}>{formatLabel(type)}</Badge>
}

export function ContactStatusBadge({ status }: { status: PaymentContactStatus }) {
  return <Badge tone={status === 'active' ? 'positive' : 'critical'}>{formatLabel(status)}</Badge>
}

export function UserRoleBadge({ role }: { role: UserRole | null }) {
  if (!role) {
    return <Badge tone='muted'>Unknown role</Badge>
  }

  const tone =
    role === 'owner' || role === 'admin'
      ? 'accent'
      : role === 'finance_manager'
        ? 'positive'
        : 'neutral'
  return <Badge tone={tone}>{formatLabel(role)}</Badge>
}
