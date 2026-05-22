'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { startSignIn, verifyCode } from '@/features/auth/api/authClient'
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
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [userLabel, setUserLabel] = useState<string | null>(null)

  const emailForm = useForm<StartSignInInput>({
    resolver: zodResolver(startSignInSchema),
    defaultValues: {
      email: '',
    },
  })

  const codeForm = useForm<VerifyCodeInput>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      challengeId: '',
      code: '',
    },
  })

  async function handleStartSignIn(values: StartSignInInput) {
    setSubmitError(null)

    try {
      const response = await startSignIn(values)

      setChallengeId(response.challengeId)
      setUserLabel(response.user.fullName)
      codeForm.reset({
        challengeId: response.challengeId,
        code: '',
      })
      setStep('code')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to start sign-in')
    }
  }

  async function handleVerifyCode(values: VerifyCodeInput) {
    setSubmitError(null)

    try {
      await verifyCode({
        ...values,
        challengeId,
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to verify code')
    }
  }

  return (
    <section className='w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm'>
      <div className='space-y-2'>
        <p className='text-sm font-medium uppercase tracking-[0.2em] text-zinc-500'>Demo Sign In</p>
        <h1 className='text-3xl font-semibold tracking-tight text-zinc-950'>Fintech Wallet</h1>
        <p className='text-sm leading-6 text-zinc-600'>
          Use an existing demo user email, then enter verification code 123456.
        </p>
      </div>

      <div className='mt-8 flex gap-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500'>
        <span className={step === 'email' ? 'text-zinc-950' : undefined}>1. Identity</span>
        <span>/</span>
        <span className={step === 'code' ? 'text-zinc-950' : undefined}>2. Code</span>
      </div>

      {submitError ? (
        <div className='mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {submitError}
        </div>
      ) : null}

      {step === 'email' ? (
        <form className='mt-6 space-y-5' onSubmit={emailForm.handleSubmit(handleStartSignIn)}>
          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium text-zinc-800'>
              Email or client email
            </label>
            <input
              id='email'
              type='email'
              autoComplete='email'
              className='w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950'
              placeholder='name@company.com'
              {...emailForm.register('email')}
            />
            {emailForm.formState.errors.email ? (
              <p className='text-sm text-red-600'>{emailForm.formState.errors.email.message}</p>
            ) : null}
          </div>

          <button
            type='submit'
            disabled={emailForm.formState.isSubmitting}
            className='w-full cursor-pointer rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400'>
            {emailForm.formState.isSubmitting ? 'Sending code...' : 'Continue'}
          </button>
        </form>
      ) : (
        <form className='mt-6 space-y-5' onSubmit={codeForm.handleSubmit(handleVerifyCode)}>
          <div className='rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700'>
            Challenge issued for{' '}
            <span className='font-semibold text-zinc-950'>{userLabel ?? 'demo user'}</span>.
          </div>

          <div className='space-y-2'>
            <label htmlFor='code' className='text-sm font-medium text-zinc-800'>
              Verification code
            </label>
            <input
              id='code'
              inputMode='numeric'
              className='w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm tracking-[0.3em] text-zinc-950 outline-none transition focus:border-zinc-950'
              placeholder='123456'
              maxLength={6}
              {...codeForm.register('code')}
            />
            {codeForm.formState.errors.code ? (
              <p className='text-sm text-red-600'>{codeForm.formState.errors.code.message}</p>
            ) : null}
          </div>

          <input type='hidden' {...codeForm.register('challengeId')} value={challengeId} readOnly />

          <div className='flex gap-3'>
            <button
              type='button'
              onClick={() => {
                setSubmitError(null)
                setStep('email')
              }}
              className='flex-1 cursor-pointer rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950'>
              Back
            </button>
            <button
              type='submit'
              disabled={codeForm.formState.isSubmitting}
              className='flex-1 cursor-pointer rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400'>
              {codeForm.formState.isSubmitting ? 'Verifying...' : 'Sign in'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
