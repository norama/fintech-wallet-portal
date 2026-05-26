import type { PaymentType } from '@/lib/types/api'

export function generateReference(paymentType: PaymentType): string {
  const rand = Math.floor(Math.random() * 9000) + 1000
  if (paymentType === 'own_wallet_transfer') {
    const year = new Date().getFullYear()
    return `INT-${year}-${String(rand).padStart(4, '0')}`
  }
  return `PAY-OPS-${rand}`
}
