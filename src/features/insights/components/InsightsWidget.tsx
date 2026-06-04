'use client'

import { InsightsChat } from '@/features/insights/components/InsightsChat'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function InsightsWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  if (pathname === '/sign-in') return null

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3'>
      {/* Always keep InsightsChat mounted so state persists across navigation */}
      <div
        className={[
          'flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl',
          isOpen ? 'h-[min(520px,calc(100svh-7rem))] w-[min(380px,calc(100vw-3rem))]' : 'hidden',
        ].join(' ')}>
        <InsightsChat onClose={() => setIsOpen(false)} />
      </div>

      {!isOpen ? (
        <button
          type='button'
          onClick={() => setIsOpen(true)}
          className='flex h-12 cursor-pointer items-center gap-2 rounded-full bg-violet-700 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-600'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            className='h-4 w-4 shrink-0'>
            <path
              fillRule='evenodd'
              d='M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM5.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 6.11 5.173L5.05 4.11a.75.75 0 0 1 0-1.06ZM14.95 3.05a.75.75 0 0 1 0 1.06l-1.06 1.062a.75.75 0 0 1-1.062-1.061l1.061-1.061a.75.75 0 0 1 1.06 0ZM3 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 3 10ZM14.75 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM6.172 13.768a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 1 1-1.062-1.06l1.061-1.062a.75.75 0 0 1 1.061 0ZM13.828 13.768a.75.75 0 0 1 1.06 0l1.062 1.061a.75.75 0 0 1-1.061 1.061l-1.061-1.06a.75.75 0 0 1 0-1.062ZM10 15.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'
              clipRule='evenodd'
            />
          </svg>
          AI Insights
        </button>
      ) : null}
    </div>
  )
}
