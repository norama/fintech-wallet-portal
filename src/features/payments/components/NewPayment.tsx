'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { PaymentStep } from '@/features/payments/components/NewPaymentCards'
import {
  DoneCard,
  PreviewCard,
  StepIndicator,
} from '@/features/payments/components/NewPaymentCards'
import { usePaymentOptions } from '@/features/payments/hooks/usePaymentOptions'
import { usePreviewPayment } from '@/features/payments/hooks/usePreviewPayment'
import { useSubmitPayment } from '@/features/payments/hooks/useSubmitPayment'
import type {
  PaymentPreviewInput,
  PaymentPreviewResponse,
  PaymentSubmitInput,
  PaymentSubmitResponse,
} from '@/features/payments/types'
import { formatMoney } from '@/lib/formatters'
import { useNavigationGuard } from '@/lib/navigation/NavigationGuardContext'

// ── Client-only form schemas ──────────────────────────────────────────────────

const externalTransferFormSchema = z.object({
  sourceWalletId: z.string().min(1, 'Source wallet is required'),
  amount: z.number({ error: 'Enter a valid amount' }).positive('Amount must be positive'),
  recipientAccountRef: z.string().min(1, 'Recipient account reference is required'),
  recipientName: z.string().optional(),
  paymentNote: z.string().max(140, 'Note must be 140 characters or fewer').optional(),
})

const ownWalletTransferFormSchema = z.object({
  sourceWalletId: z.string().min(1, 'Source wallet is required'),
  amount: z.number({ error: 'Enter a valid amount' }).positive('Amount must be positive'),
  targetWalletId: z.string().min(1, 'Target wallet is required'),
  paymentNote: z.string().max(140, 'Note must be 140 characters or fewer').optional(),
})

type ExternalTransferFormValues = z.infer<typeof externalTransferFormSchema>
type OwnWalletTransferFormValues = z.infer<typeof ownWalletTransferFormSchema>

type ActivePaymentType = 'external_transfer' | 'own_wallet_transfer'

// ── Main component ─────────────────────────────────────────────────────────────

export function NewPayment() {
  const [step, setStep] = useState<PaymentStep>('details')
  const [paymentType, setPaymentType] = useState<ActivePaymentType>('external_transfer')
  const [lastPreviewInput, setLastPreviewInput] = useState<PaymentPreviewInput | null>(null)
  const [previewData, setPreviewData] = useState<PaymentPreviewResponse | null>(null)
  const [submitResult, setSubmitResult] = useState<PaymentSubmitResponse | null>(null)
  const [authCode, setAuthCode] = useState('')

  const { data: options, isLoading: optionsLoading, error: optionsError } = usePaymentOptions()
  const previewMutation = usePreviewPayment()
  const submitMutation = useSubmitPayment()
  const { setIsDirty } = useNavigationGuard()

  // eslint-disable-next-line react-hooks/exhaustive-deps -- options?.wallets is stable from TanStack Query; ?? [] is a harmless fallback
  const wallets = options?.wallets ?? []

  const externalForm = useForm<ExternalTransferFormValues>({
    resolver: zodResolver(externalTransferFormSchema),
    mode: 'onTouched',
    defaultValues: {
      sourceWalletId: '',
      amount: undefined as unknown as number,
      recipientAccountRef: '',
      recipientName: '',
      paymentNote: '',
    },
  })

  const ownWalletForm = useForm<OwnWalletTransferFormValues>({
    resolver: zodResolver(ownWalletTransferFormSchema),
    mode: 'onTouched',
    defaultValues: {
      sourceWalletId: '',
      amount: undefined as unknown as number,
      targetWalletId: '',
      paymentNote: '',
    },
  })

  function buildExternalPreviewInput(values: ExternalTransferFormValues): PaymentPreviewInput {
    const amountMinor = Math.round(values.amount * 100)
    const input: PaymentPreviewInput = {
      paymentType: 'external_transfer',
      sourceWalletId: values.sourceWalletId,
      amountMinor,
      recipientAccountRef: values.recipientAccountRef,
      ...(values.recipientName ? { recipientName: values.recipientName } : {}),
      ...(values.paymentNote ? { paymentNote: values.paymentNote } : {}),
    }
    return input
  }

  function buildOwnWalletPreviewInput(values: OwnWalletTransferFormValues): PaymentPreviewInput {
    const amountMinor = Math.round(values.amount * 100)
    const input: PaymentPreviewInput = {
      paymentType: 'own_wallet_transfer',
      sourceWalletId: values.sourceWalletId,
      amountMinor,
      targetWalletId: values.targetWalletId,
      ...(values.paymentNote ? { paymentNote: values.paymentNote } : {}),
    }
    return input
  }

  async function handleExternalPreview(values: ExternalTransferFormValues) {
    const wallet = wallets.find((w) => w.id === values.sourceWalletId)
    if (wallet && Math.round(values.amount * 100) > wallet.availableBalanceMinor) {
      externalForm.setError('amount', {
        type: 'balance',
        message: `Exceeds available balance (${formatMoney(wallet.availableBalanceMinor, wallet.currency)})`,
      })
      return
    }
    const input = buildExternalPreviewInput(values)
    const preview = await previewMutation.mutateAsync(input)
    setLastPreviewInput(input)
    setPreviewData(preview)
    setAuthCode('')
    setStep('preview')
  }

  async function handleOwnWalletPreview(values: OwnWalletTransferFormValues) {
    const wallet = wallets.find((w) => w.id === values.sourceWalletId)
    if (wallet && Math.round(values.amount * 100) > wallet.availableBalanceMinor) {
      ownWalletForm.setError('amount', {
        type: 'balance',
        message: `Exceeds available balance (${formatMoney(wallet.availableBalanceMinor, wallet.currency)})`,
      })
      return
    }
    const input = buildOwnWalletPreviewInput(values)
    const preview = await previewMutation.mutateAsync(input)
    setLastPreviewInput(input)
    setPreviewData(preview)
    setStep('preview')
  }

  async function handleSubmit() {
    if (!lastPreviewInput) return

    let submitInput: PaymentSubmitInput
    if (lastPreviewInput.paymentType === 'external_transfer') {
      submitInput = { ...lastPreviewInput, ...(authCode ? { authorizationCode: authCode } : {}) }
    } else {
      submitInput = lastPreviewInput
    }

    const result = await submitMutation.mutateAsync(submitInput)
    setSubmitResult(result)
    setStep('done')
  }

  function handleReset() {
    setStep('details')
    setLastPreviewInput(null)
    setPreviewData(null)
    setSubmitResult(null)
    setAuthCode('')
    previewMutation.reset()
    submitMutation.reset()
    externalForm.reset()
    ownWalletForm.reset()
  }

  const previewError = previewMutation.error?.message ?? null
  const submitError = submitMutation.error?.message ?? null
  const sourceWalletIdForOwn = useWatch({ control: ownWalletForm.control, name: 'sourceWalletId' })
  const sourceWalletIdForExternal = useWatch({
    control: externalForm.control,
    name: 'sourceWalletId',
  })
  const externalAmount = useWatch({ control: externalForm.control, name: 'amount' })
  const ownAmount = useWatch({ control: ownWalletForm.control, name: 'amount' })

  const externalFormTouched = Object.keys(externalForm.formState.touchedFields).length > 0
  const ownWalletFormTouched = Object.keys(ownWalletForm.formState.touchedFields).length > 0

  const isPaymentInProgress =
    (externalFormTouched || ownWalletFormTouched || step === 'preview') && step !== 'done'

  useEffect(() => {
    setIsDirty(isPaymentInProgress)
    return () => {
      setIsDirty(false)
    }
  }, [isPaymentInProgress, setIsDirty])

  useEffect(() => {
    if (!isPaymentInProgress) return
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isPaymentInProgress])

  useEffect(() => {
    const wallet = wallets.find((w) => w.id === sourceWalletIdForExternal)
    if (
      !isNaN(externalAmount) &&
      externalAmount > 0 &&
      wallet &&
      Math.round(externalAmount * 100) > wallet.availableBalanceMinor
    ) {
      externalForm.setError('amount', {
        type: 'balance',
        message: `Exceeds available balance (${formatMoney(wallet.availableBalanceMinor, wallet.currency)})`,
      })
    } else if (externalForm.getFieldState('amount').error?.type === 'balance') {
      externalForm.clearErrors('amount')
    }
  }, [externalAmount, sourceWalletIdForExternal, wallets, externalForm])

  useEffect(() => {
    const wallet = wallets.find((w) => w.id === sourceWalletIdForOwn)
    if (
      !isNaN(ownAmount) &&
      ownAmount > 0 &&
      wallet &&
      Math.round(ownAmount * 100) > wallet.availableBalanceMinor
    ) {
      ownWalletForm.setError('amount', {
        type: 'balance',
        message: `Exceeds available balance (${formatMoney(wallet.availableBalanceMinor, wallet.currency)})`,
      })
    } else if (ownWalletForm.getFieldState('amount').error?.type === 'balance') {
      ownWalletForm.clearErrors('amount')
    }
  }, [ownAmount, sourceWalletIdForOwn, wallets, ownWalletForm])

  return (
    <div className='w-full max-w-xl'>
      <Card
        tone='default'
        eyebrow='New payment'
        title='Transfer funds'
        description='Preview your payment before confirming. All amounts are in the wallet currency.'>
        <StepIndicator step={step} />

        {/* ── Step 1: Details ── */}
        {step === 'details' ? (
          <div className='space-y-5'>
            {/* Payment type toggle */}
            <div className='flex rounded-xl bg-zinc-100 p-1 text-sm font-medium'>
              {(['external_transfer', 'own_wallet_transfer'] as const).map((type) => (
                <button
                  key={type}
                  type='button'
                  onClick={() => setPaymentType(type)}
                  className={[
                    'flex-1 cursor-pointer rounded-lg px-3 py-2 text-center transition',
                    paymentType === type
                      ? 'border border-zinc-300 bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700',
                  ].join(' ')}>
                  {type === 'external_transfer' ? 'External transfer' : 'Own wallet'}
                </button>
              ))}
            </div>

            {previewError ? (
              <Alert tone='danger' title='Preview failed' description={previewError} />
            ) : null}

            {optionsError ? (
              <Alert
                tone='danger'
                title='Could not load wallets'
                description={optionsError.message}
              />
            ) : null}

            {/* External transfer form */}
            {paymentType === 'external_transfer' ? (
              <form
                noValidate
                className='space-y-4'
                onSubmit={externalForm.handleSubmit(handleExternalPreview)}>
                <Field
                  htmlFor='ext-sourceWalletId'
                  label='Source wallet'
                  error={externalForm.formState.errors.sourceWalletId?.message}>
                  <Select
                    id='ext-sourceWalletId'
                    disabled={optionsLoading}
                    {...externalForm.register('sourceWalletId')}>
                    <option value=''>Select a wallet…</option>
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {formatMoney(w.availableBalanceMinor, w.currency)} available
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  htmlFor='ext-amount'
                  label='Amount'
                  error={externalForm.formState.errors.amount?.message}>
                  <Input
                    id='ext-amount'
                    type='number'
                    step='0.01'
                    min='0.01'
                    placeholder='0.00'
                    tone={externalForm.formState.errors.amount ? 'error' : 'default'}
                    {...externalForm.register('amount', { valueAsNumber: true })}
                  />
                </Field>

                <Field
                  htmlFor='ext-recipientAccountRef'
                  label='Recipient account reference'
                  hint='IBAN, account number, or other identifier.'
                  error={externalForm.formState.errors.recipientAccountRef?.message}>
                  <Input
                    id='ext-recipientAccountRef'
                    placeholder='DE99••••1234'
                    tone={externalForm.formState.errors.recipientAccountRef ? 'error' : 'default'}
                    {...externalForm.register('recipientAccountRef')}
                  />
                </Field>

                <Field
                  htmlFor='ext-recipientName'
                  label='Recipient name'
                  hint='Optional — leave blank if not known.'
                  error={externalForm.formState.errors.recipientName?.message}>
                  <Input
                    id='ext-recipientName'
                    placeholder='Acme Ltd.'
                    {...externalForm.register('recipientName')}
                  />
                </Field>

                <Field
                  htmlFor='ext-paymentNote'
                  label='Payment note'
                  hint='Optional — up to 140 characters.'
                  error={externalForm.formState.errors.paymentNote?.message}>
                  <Input
                    id='ext-paymentNote'
                    placeholder='Invoice 2026-0421'
                    {...externalForm.register('paymentNote')}
                  />
                </Field>

                <Button type='submit' block disabled={previewMutation.isPending || optionsLoading}>
                  {previewMutation.isPending ? 'Getting preview…' : 'Get preview →'}
                </Button>
              </form>
            ) : null}

            {/* Own wallet transfer form */}
            {paymentType === 'own_wallet_transfer' ? (
              <form
                noValidate
                className='space-y-4'
                onSubmit={ownWalletForm.handleSubmit(handleOwnWalletPreview)}>
                <Field
                  htmlFor='own-sourceWalletId'
                  label='Source wallet'
                  error={ownWalletForm.formState.errors.sourceWalletId?.message}>
                  <Select
                    id='own-sourceWalletId'
                    disabled={optionsLoading}
                    {...ownWalletForm.register('sourceWalletId')}>
                    <option value=''>Select a wallet…</option>
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {formatMoney(w.availableBalanceMinor, w.currency)} available
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  htmlFor='own-amount'
                  label='Amount'
                  error={ownWalletForm.formState.errors.amount?.message}>
                  <Input
                    id='own-amount'
                    type='number'
                    step='0.01'
                    min='0.01'
                    placeholder='0.00'
                    tone={ownWalletForm.formState.errors.amount ? 'error' : 'default'}
                    {...ownWalletForm.register('amount', { valueAsNumber: true })}
                  />
                </Field>

                <Field
                  htmlFor='own-targetWalletId'
                  label='Target wallet'
                  error={ownWalletForm.formState.errors.targetWalletId?.message}>
                  <Select
                    id='own-targetWalletId'
                    disabled={optionsLoading}
                    {...ownWalletForm.register('targetWalletId')}>
                    <option value=''>Select a wallet…</option>
                    {wallets
                      .filter((w) => w.id !== sourceWalletIdForOwn)
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} — {formatMoney(w.availableBalanceMinor, w.currency)} available
                        </option>
                      ))}
                  </Select>
                </Field>

                <Field
                  htmlFor='own-paymentNote'
                  label='Payment note'
                  hint='Optional — up to 140 characters.'
                  error={ownWalletForm.formState.errors.paymentNote?.message}>
                  <Input
                    id='own-paymentNote'
                    placeholder='Move funds to CZK wallet'
                    {...ownWalletForm.register('paymentNote')}
                  />
                </Field>

                <Button type='submit' block disabled={previewMutation.isPending || optionsLoading}>
                  {previewMutation.isPending ? 'Getting preview…' : 'Get preview →'}
                </Button>
              </form>
            ) : null}
          </div>
        ) : null}

        {/* ── Step 2: Preview ── */}
        {step === 'preview' && previewData ? (
          <div className='space-y-5'>
            {submitError ? (
              <Alert tone='danger' title='Submission failed' description={submitError} />
            ) : null}

            <PreviewCard preview={previewData} />

            {lastPreviewInput?.paymentType === 'external_transfer' ? (
              <Field htmlFor='authCode' label='Authorization code' hint='Use the demo code: 123456'>
                <Input
                  id='authCode'
                  inputMode='numeric'
                  placeholder='123456'
                  maxLength={6}
                  spacing='code'
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                />
              </Field>
            ) : null}

            <div className='flex gap-3'>
              <div className='flex-1'>
                <Button
                  type='button'
                  variant='secondary'
                  block
                  onClick={() => {
                    previewMutation.reset()
                    submitMutation.reset()
                    setStep('details')
                  }}>
                  Back
                </Button>
              </div>
              <div className='flex-1'>
                <Button
                  type='button'
                  block
                  disabled={submitMutation.isPending}
                  onClick={() => void handleSubmit()}>
                  {submitMutation.isPending ? 'Submitting…' : 'Confirm payment'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ── Step 3: Done ── */}
        {step === 'done' && submitResult ? (
          <div className='space-y-5'>
            <DoneCard result={submitResult} />
            <Button type='button' block variant='secondary' onClick={handleReset}>
              Make another payment
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
