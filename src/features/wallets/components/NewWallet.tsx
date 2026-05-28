'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useCreateWallet } from '@/features/wallets/hooks/useCreateWallet'
import { WALLET_CURRENCY_OPTIONS } from '@/features/wallets/types'
import { useNavigationGuard } from '@/lib/navigation/NavigationGuardContext'

const newWalletFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Wallet name is required' })
    .max(80, { error: 'Name must be 80 characters or fewer' }),
  currency: z.enum(['EUR', 'CZK', 'USD', 'GBP'], { error: 'Please select a currency' }),
})

type NewWalletFormValues = z.infer<typeof newWalletFormSchema>

export function NewWallet() {
  const router = useRouter()
  const createWalletMutation = useCreateWallet()
  const { setIsDirty } = useNavigationGuard()

  const form = useForm<NewWalletFormValues>({
    resolver: zodResolver(newWalletFormSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      currency: '' as unknown as NewWalletFormValues['currency'],
    },
  })

  const formTouched = Object.keys(form.formState.touchedFields).length > 0
  const isFormInProgress = formTouched && !createWalletMutation.isSuccess

  useEffect(() => {
    setIsDirty(isFormInProgress)
    return () => {
      setIsDirty(false)
    }
  }, [isFormInProgress, setIsDirty])

  useEffect(() => {
    if (!isFormInProgress) return
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isFormInProgress])

  function guardedClickHandler(e: React.MouseEvent, href: string) {
    if (isFormInProgress) {
      e.preventDefault()
      if (window.confirm('You have unsaved changes. Leave this page?')) {
        void router.push(href)
      }
    }
  }

  async function handleSubmit(values: NewWalletFormValues) {
    await createWalletMutation.mutateAsync(values)
    router.push('/wallets')
  }

  const serverError =
    createWalletMutation.error instanceof Error ? createWalletMutation.error.message : null

  return (
    <div className='w-full max-w-xl'>
      <Card
        tone='wallet'
        eyebrow='Wallet management'
        title='New wallet'
        description='Create a zero-balance wallet for a selected currency.'>
        <form noValidate className='space-y-5' onSubmit={form.handleSubmit(handleSubmit)}>
          {serverError ? (
            <Alert tone='danger' title='Could not create wallet' description={serverError} />
          ) : null}

          <Field
            htmlFor='wallet-name'
            label='Wallet name'
            error={form.formState.errors.name?.message}>
            <Input
              id='wallet-name'
              type='text'
              placeholder='e.g. EUR Operating Account'
              {...form.register('name')}
            />
          </Field>

          <Field
            htmlFor='wallet-currency'
            label='Currency'
            error={form.formState.errors.currency?.message}>
            <Select id='wallet-currency' {...form.register('currency')}>
              <option value=''>Select a currency…</option>
              {WALLET_CURRENCY_OPTIONS.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </Select>
          </Field>

          <div className='flex gap-3 pt-1'>
            <Link
              href='/wallets'
              onClick={(e) => guardedClickHandler(e, '/wallets')}
              className='inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:border-zinc-950 hover:bg-zinc-50'>
              Cancel
            </Link>
            <Button type='submit' disabled={createWalletMutation.isPending}>
              {createWalletMutation.isPending ? 'Creating…' : 'Create wallet'}
            </Button>
          </div>
        </form>
      </Card>

      <div className='flex justify-end pt-4'>
        <Link
          href='/wallets'
          onClick={(e) => guardedClickHandler(e, '/wallets')}
          className='inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-800'>
          ← Back to wallets
        </Link>
      </div>
    </div>
  )
}
