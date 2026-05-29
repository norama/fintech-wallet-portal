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
import { ContactsRequestError } from '@/features/contacts/api/contactsClient'
import { useCreateContact } from '@/features/contacts/hooks/useCreateContact'
import { useNavigationGuard } from '@/lib/navigation/NavigationGuardContext'

const newContactFormSchema = z.object({
  email: z.email({ error: 'Must be a valid email address' }),
  nickname: z
    .string()
    .trim()
    .min(1, { error: 'Nickname is required' })
    .max(80, { error: 'Nickname must be 80 characters or fewer' }),
})

type NewContactFormValues = z.infer<typeof newContactFormSchema>

function getServerErrorMessage(error: unknown): string {
  if (error instanceof ContactsRequestError) {
    switch (error.code) {
      case 'SELF_CONTACT':
        return 'You cannot add yourself as a contact.'
      case 'DUPLICATE_CONTACT':
        return 'A contact with this email already exists.'
      case 'USER_NOT_FOUND':
        return 'No active user found with that email address.'
      default:
        return error.message
    }
  }

  return error instanceof Error ? error.message : 'An unexpected error occurred.'
}

export function NewContact() {
  const router = useRouter()
  const createContactMutation = useCreateContact()
  const { setIsDirty } = useNavigationGuard()

  const form = useForm<NewContactFormValues>({
    resolver: zodResolver(newContactFormSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      nickname: '',
    },
  })

  const formTouched = Object.keys(form.formState.touchedFields).length > 0
  const isFormInProgress = formTouched && !createContactMutation.isSuccess

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

  async function handleSubmit(values: NewContactFormValues) {
    await createContactMutation.mutateAsync(values)
    router.push('/contacts')
  }

  const serverError = createContactMutation.error
    ? getServerErrorMessage(createContactMutation.error)
    : null

  return (
    <div className='w-full max-w-xl'>
      <Card
        tone='status'
        eyebrow='Contact management'
        title='New contact'
        description='Add a recipient by their email address. You can then send payments to their primary wallet.'>
        <form noValidate className='space-y-5' onSubmit={form.handleSubmit(handleSubmit)}>
          {serverError ? (
            <Alert tone='danger' title='Could not add contact' description={serverError} />
          ) : null}

          <Field
            htmlFor='contact-email'
            label='Email address'
            error={form.formState.errors.email?.message}>
            <Input
              id='contact-email'
              type='email'
              placeholder='recipient@example.com'
              {...form.register('email')}
            />
          </Field>

          <Field
            htmlFor='contact-nickname'
            label='Nickname'
            hint='A short label to identify this contact in your list.'
            error={form.formState.errors.nickname?.message}>
            <Input
              id='contact-nickname'
              type='text'
              placeholder='e.g. Alice from accounting'
              {...form.register('nickname')}
            />
          </Field>

          <div className='flex gap-3 pt-1'>
            <Link
              href='/contacts'
              onClick={(e) => guardedClickHandler(e, '/contacts')}
              className='inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:border-zinc-950 hover:bg-zinc-50'>
              Cancel
            </Link>
            <Button type='submit' disabled={createContactMutation.isPending}>
              {createContactMutation.isPending ? 'Adding…' : 'Add contact'}
            </Button>
          </div>
        </form>
      </Card>

      <div className='flex justify-end pt-4'>
        <Link
          href='/contacts'
          onClick={(e) => guardedClickHandler(e, '/contacts')}
          className='inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-800'>
          ← Back to contacts
        </Link>
      </div>
    </div>
  )
}
