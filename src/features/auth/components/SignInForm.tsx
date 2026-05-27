'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { getStartSignInMutationOptions, getVerifyCodeMutationOptions } from '@/lib/query/authQuery'
import {
  startSignInSchema,
  verifyCodeSchema,
  type StartSignInInput,
  type VerifyCodeInput,
} from '@/lib/validation/authSchemas'

type SignInStep = 'email' | 'code'

export function SignInForm() {
  const router = useRouter()
  const [step, setStep] = useState<SignInStep>('email')
  const [challengeId, setChallengeId] = useState('')
  const [userLabel, setUserLabel] = useState<string | null>(null)

  const emailForm = useForm<StartSignInInput>({
    resolver: zodResolver(startSignInSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
    },
  })

  const codeForm = useForm<VerifyCodeInput>({
    resolver: zodResolver(verifyCodeSchema),
    mode: 'onTouched',
    defaultValues: {
      challengeId: '',
      code: '',
    },
  })

  const startSignInMutation = useMutation({
    ...getStartSignInMutationOptions(),
    onSuccess: (response) => {
      setChallengeId(response.challengeId)
      setUserLabel(response.user.fullName)
      codeForm.reset({
        challengeId: response.challengeId,
        code: '',
      })
      setStep('code')
    },
  })

  const verifyCodeMutation = useMutation({
    ...getVerifyCodeMutationOptions(),
    onSuccess: async () => {
      await router.push('/dashboard')
      router.refresh()
    },
  })

  async function handleStartSignIn(values: StartSignInInput) {
    await startSignInMutation.mutateAsync(values)
  }

  async function handleVerifyCode(values: VerifyCodeInput) {
    await verifyCodeMutation.mutateAsync({
      ...values,
      challengeId,
    })
  }

  const submitError =
    (step === 'email' ? startSignInMutation.error : verifyCodeMutation.error)?.message ?? null

  return (
    <div className='w-full max-w-xl lg:justify-self-end'>
      <Card
        tone='default'
        eyebrow='Demo Sign In'
        title='Fintech Wallet'
        description='Use an existing demo user email, then complete the fixed verification step to access the portal.'>
        <div className='flex rounded-full border border-zinc-200 bg-zinc-50 p-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500'>
          <span
            className={[
              'flex-1 rounded-full px-3 py-2 text-center transition',
              step === 'email' ? 'bg-white text-zinc-950 shadow-sm' : '',
            ].join(' ')}>
            1. Identity
          </span>
          <span
            className={[
              'flex-1 rounded-full px-3 py-2 text-center transition',
              step === 'code' ? 'bg-white text-zinc-950 shadow-sm' : '',
            ].join(' ')}>
            2. Code
          </span>
        </div>

        {submitError ? (
          <Alert tone='danger' title='Sign-in failed' description={submitError} />
        ) : null}

        {step === 'email' ? (
          <form
            noValidate
            className='space-y-5'
            onSubmit={emailForm.handleSubmit(handleStartSignIn)}>
            <Field
              htmlFor='email'
              label='Email or client email'
              hint='Use an existing demo user or client email from the seeded dataset.'
              error={emailForm.formState.errors.email?.message}>
              <Input
                id='email'
                type='email'
                autoComplete='email'
                placeholder='name@company.com'
                tone={emailForm.formState.errors.email ? 'error' : 'default'}
                aria-invalid={emailForm.formState.errors.email ? true : undefined}
                {...emailForm.register('email')}
              />
            </Field>

            <Button type='submit' block size='lg' disabled={startSignInMutation.isPending}>
              {startSignInMutation.isPending ? 'Sending code...' : 'Continue'}
            </Button>
          </form>
        ) : (
          <form noValidate className='space-y-5' onSubmit={codeForm.handleSubmit(handleVerifyCode)}>
            <Alert
              tone='info'
              title='Challenge issued'
              description={`Verification started for ${userLabel ?? 'demo user'}. Use code 123456 to continue.`}
            />

            <Field
              htmlFor='code'
              label='Verification code'
              hint='Use the fixed demo code to complete the mocked banking sign-in flow.'
              error={codeForm.formState.errors.code?.message}>
              <Input
                id='code'
                inputMode='numeric'
                placeholder='123456'
                maxLength={6}
                spacing='code'
                tone={codeForm.formState.errors.code ? 'error' : 'default'}
                aria-invalid={codeForm.formState.errors.code ? true : undefined}
                {...codeForm.register('code')}
              />
            </Field>

            <input
              type='hidden'
              {...codeForm.register('challengeId')}
              value={challengeId}
              readOnly
            />

            <div className='flex gap-3'>
              <div className='flex-1'>
                <Button
                  type='button'
                  variant='secondary'
                  block
                  onClick={() => {
                    startSignInMutation.reset()
                    verifyCodeMutation.reset()
                    setStep('email')
                  }}>
                  Back
                </Button>
              </div>
              <div className='flex-1'>
                <Button type='submit' block disabled={verifyCodeMutation.isPending}>
                  {verifyCodeMutation.isPending ? 'Verifying...' : 'Sign in'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
