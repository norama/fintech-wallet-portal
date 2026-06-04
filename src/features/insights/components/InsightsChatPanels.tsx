'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { RefObject } from 'react'

export type InsightChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  usedTools?: string[] | undefined
}

const STARTER_PROMPTS = [
  'Which transactions need attention?',
  'Why is my available balance lower than total balance?',
  'Summarize recent outgoing payments.',
  'Do I have enough CZK liquidity?',
  'Which wallets have reserved funds?',
]

// ─── Header ──────────────────────────────────────────────────────────────────

type ChatHeaderProps = {
  hasMessages: boolean
  onClear: () => void
  onClose: () => void
}

export function ChatHeader({ hasMessages, onClear, onClose }: ChatHeaderProps) {
  return (
    <div className='flex items-center justify-between border-b border-zinc-200 px-4 py-3'>
      <div className='flex items-center gap-2'>
        <span className='text-sm font-semibold text-zinc-900'>AI Insights</span>
        <Badge tone='info' size='sm'>
          Beta
        </Badge>
      </div>
      <div className='flex items-center gap-1'>
        {hasMessages ? (
          <Button variant='ghost' size='sm' onClick={onClear}>
            Clear
          </Button>
        ) : null}
        <Button variant='ghost' size='icon' onClick={onClose} aria-label='Close AI Insights'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            className='h-4 w-4'>
            <path d='M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z' />
          </svg>
        </Button>
      </div>
    </div>
  )
}

// ─── Starter prompts ─────────────────────────────────────────────────────────

type StarterPromptsProps = {
  disabled: boolean
  onSelect: (prompt: string) => void
}

export function StarterPrompts({ disabled, onSelect }: StarterPromptsProps) {
  return (
    <div className='space-y-3'>
      <p className='text-xs text-zinc-500'>Ask a question about your finances:</p>
      <div className='flex flex-wrap gap-2'>
        {STARTER_PROMPTS.map((prompt) => (
          <Button
            key={prompt}
            variant='chip'
            size='xs'
            onClick={() => onSelect(prompt)}
            disabled={disabled}>
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

type MessageBubbleProps = {
  message: InsightChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  return (
    <div className={['flex', isUser ? 'justify-end' : 'justify-start'].join(' ')}>
      <div
        className={[
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
          isUser ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-800',
        ].join(' ')}>
        <p className='whitespace-pre-wrap'>{message.content}</p>
        {message.usedTools && message.usedTools.length > 0 ? (
          <div className='mt-2 flex flex-wrap gap-1'>
            {message.usedTools.map((tool, i) => (
              <Badge key={`${tool}-${i}`} tone='muted' size='sm'>
                {tool}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ─── Thinking bubble ─────────────────────────────────────────────────────────

export function ThinkingBubble() {
  return (
    <div className='flex justify-start'>
      <div className='flex items-center gap-2.5 rounded-2xl bg-zinc-100 px-3.5 py-3'>
        <svg
          className='h-4 w-4 shrink-0 animate-spin text-zinc-400'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          aria-hidden='true'>
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
          />
        </svg>
        <span className='text-sm text-zinc-500'>AI is analyzing…</span>
      </div>
    </div>
  )
}

// ─── Error bubble ─────────────────────────────────────────────────────────────

type ErrorBubbleProps = {
  error: Error | null
  onEditAndRetry: () => void
}

export function ErrorBubble({ error, onEditAndRetry }: ErrorBubbleProps) {
  return (
    <div className='flex justify-start'>
      <div className='rounded-2xl bg-red-50 px-3.5 py-2.5 ring-1 ring-red-200'>
        <p className='text-sm text-red-700'>
          {error?.message ?? 'Something went wrong. Please try again.'}
        </p>
        <Button variant='ghost' size='xs' onClick={onEditAndRetry}>
          Edit and retry
        </Button>
      </div>
    </div>
  )
}

// ─── Chat input ───────────────────────────────────────────────────────────────

type ChatInputProps = {
  value: string
  isPending: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onSend: () => void
}

export function ChatInput({
  value,
  isPending,
  textareaRef,
  onChange,
  onKeyDown,
  onSend,
}: ChatInputProps) {
  return (
    <div className='border-t border-zinc-200 px-3 pb-3 pt-2'>
      <div className='flex gap-2'>
        <textarea
          ref={textareaRef}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder='Ask about your finances...'
          disabled={isPending}
          className='min-h-0 flex-1 resize-none rounded-2xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100'
        />
        <Button
          variant='primary'
          size='sm'
          disabled={!value.trim() || isPending}
          onClick={onSend}
          aria-label='Send message'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            className='h-4 w-4'>
            <path d='M3.105 2.288a.75.75 0 0 0-.826.95l1.908 6.637H10.5a.75.75 0 0 1 0 1.5H4.187l-1.908 6.637a.75.75 0 0 0 .826.95 28.896 28.896 0 0 0 15.777-8.049.75.75 0 0 0 0-1.122A28.897 28.897 0 0 0 3.105 2.288Z' />
          </svg>
        </Button>
      </div>
    </div>
  )
}
