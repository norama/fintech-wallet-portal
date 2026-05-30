'use client'

import { useEffect, useRef, useState } from 'react'

import type { PaymentsContact } from '@/features/payments/types'

type Props = {
  id: string
  contacts: PaymentsContact[]
  value: string // selected contact id
  onChange: (contactId: string) => void
  disabled?: boolean
  tone?: 'default' | 'error'
}

export function ContactCombobox({ id, contacts, value, onChange, disabled, tone }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = contacts.find((c) => c.id === value) ?? null

  // Keep display in sync when value is cleared externally
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    if (!value) setQuery('')
  }

  const filtered =
    query.trim() === ''
      ? contacts
      : contacts.filter(
          (c) =>
            c.nickname.toLowerCase().includes(query.toLowerCase()) ||
            c.targetAccount.displayName.toLowerCase().includes(query.toLowerCase()),
        )

  function handleSelect(contact: PaymentsContact) {
    onChange(contact.id)
    setQuery('')
    setOpen(false)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    if (!open) setOpen(true)
    // Clear selection if user edits the query
    if (value) onChange('')
  }

  function handleFocus() {
    setOpen(true)
  }

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayValue = selected ? selected.nickname : query

  const borderClass =
    tone === 'error'
      ? 'border-red-400 focus-within:ring-red-300'
      : 'border-zinc-300 focus-within:ring-zinc-200'

  return (
    <div ref={containerRef} className='relative'>
      <input
        id={id}
        type='text'
        autoComplete='off'
        disabled={disabled}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder='Search contacts…'
        className={[
          'w-full rounded-xl border px-3 py-2 text-sm text-zinc-900 outline-none',
          'placeholder:text-zinc-400 focus:ring-2 focus:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          borderClass,
        ].join(' ')}
      />

      {open && !disabled && filtered.length > 0 ? (
        <ul
          role='listbox'
          className='absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg'>
          {filtered.map((contact) => (
            <li
              key={contact.id}
              role='option'
              aria-selected={contact.id === value}
              onMouseDown={(e) => {
                e.preventDefault() // prevent input blur before click registers
                handleSelect(contact)
              }}
              className={[
                'flex cursor-pointer flex-col px-3 py-2 text-sm',
                contact.id === value ? 'bg-zinc-100' : 'hover:bg-zinc-50',
              ].join(' ')}>
              <span className='font-medium text-zinc-900'>{contact.nickname}</span>
              <span className='text-xs text-zinc-500'>
                {contact.targetAccount.displayName} · {contact.availableCurrencies.join(', ')}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {open && !disabled && filtered.length === 0 && query.trim() !== '' ? (
        <div className='absolute z-20 mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500 shadow-lg'>
          No contacts match &quot;{query}&quot;
        </div>
      ) : null}
    </div>
  )
}
