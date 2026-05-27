import type { PaymentPreviewResponse, PaymentSubmitResponse } from '@/features/payments/types'
import { formatMoney } from '@/lib/formatters'

export type PaymentStep = 'details' | 'preview' | 'done'

export function StepIndicator({ step }: { step: PaymentStep }) {
  const steps: { key: PaymentStep; num: string; text: string }[] = [
    { key: 'details', num: '1.', text: 'Details' },
    { key: 'preview', num: '2.', text: 'Preview' },
    { key: 'done', num: '3.', text: 'Done' },
  ]

  return (
    <div className='flex rounded-full border border-zinc-200 bg-zinc-50 p-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500'>
      {steps.map(({ key, num, text }) => (
        <span
          key={key}
          className={[
            'flex-1 rounded-full px-3 py-2 text-center transition',
            step === key ? 'bg-white text-zinc-950 shadow-sm' : '',
          ].join(' ')}>
          <span className='hidden sm:inline'>
            {num} {text}
          </span>
          <span className='sm:hidden'>
            {num}
            <br />
            {text}
          </span>
        </span>
      ))}
    </div>
  )
}

export function PreviewCard({ preview }: { preview: PaymentPreviewResponse }) {
  return (
    <div className='space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4'>
      <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
        <span className='text-zinc-500'>From</span>
        <span className='font-medium text-zinc-950'>
          {preview.source.walletName} ({preview.source.currency})
        </span>

        <span className='text-zinc-500'>Available</span>
        <span className='font-medium text-zinc-950'>
          {formatMoney(preview.source.availableBalanceMinor, preview.source.currency)}
        </span>

        <span className='text-zinc-500'>Balance after</span>
        <span
          className={[
            'font-medium',
            preview.source.balanceAfterMinor < preview.source.availableBalanceMinor * 0.1
              ? 'text-amber-600'
              : 'text-zinc-950',
          ].join(' ')}>
          {formatMoney(preview.source.balanceAfterMinor, preview.source.currency)}
        </span>

        <span className='text-zinc-500'>To</span>
        <span className='font-medium text-zinc-950'>
          {preview.target.name ?? preview.target.ref} ({preview.target.currency})
        </span>

        <span className='text-zinc-500'>You send</span>
        <span className='font-medium text-zinc-950'>
          {formatMoney(preview.sendAmount.amountMinor, preview.sendAmount.currency)}
        </span>

        {preview.exchangeRate !== null ? (
          <>
            <span className='text-zinc-500'>Rate</span>
            <span className='font-medium text-zinc-950'>
              1 {preview.sendAmount.currency} = {preview.exchangeRate}{' '}
              {preview.receiveAmount.currency}
            </span>
          </>
        ) : null}

        <span className='text-zinc-500'>Recipient gets</span>
        <span className='font-semibold text-zinc-950'>
          {formatMoney(preview.receiveAmount.amountMinor, preview.receiveAmount.currency)}
        </span>

        <span className='text-zinc-500'>Est. status</span>
        <span
          className={[
            'inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium',
            preview.estimatedStatus === 'completed'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800',
          ].join(' ')}>
          {preview.estimatedStatus}
        </span>
      </div>

      {preview.warnings.length > 0 ? (
        <div className='space-y-2 pt-1'>
          {preview.warnings.map((warning, i) => (
            <p key={i} className='text-xs text-amber-700'>
              ⚠ {warning}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function DoneCard({ result }: { result: PaymentSubmitResponse }) {
  return (
    <div className='space-y-4'>
      <div className='rounded-2xl border border-emerald-200 bg-emerald-50 p-4'>
        <p className='text-sm font-semibold text-emerald-900'>Payment submitted</p>
        <div className='mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
          <span className='text-emerald-700'>Reference</span>
          <span className='font-mono font-medium text-emerald-900'>{result.reference}</span>
          <span className='text-emerald-700'>Status</span>
          <span className='font-medium capitalize text-emerald-900'>{result.status}</span>
        </div>
      </div>

      {result.createdTransactions.length > 0 ? (
        <div className='space-y-2'>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500'>
            Created transactions
          </p>
          {result.createdTransactions.map((tx) => (
            <div
              key={tx.id}
              className='flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm'>
              <div className='space-y-0.5'>
                <p className='font-medium capitalize text-zinc-950'>
                  {tx.direction} · {tx.transactionType.replace('_', ' ')}
                </p>
                <p className='font-mono text-xs text-zinc-400'>{tx.id.slice(0, 8)}…</p>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-zinc-950'>
                  {formatMoney(tx.amountMinor, tx.currency)}
                </p>
                <span
                  className={[
                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                    tx.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800',
                  ].join(' ')}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
