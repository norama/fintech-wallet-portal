'use client'

import {
  ChatHeader,
  ChatInput,
  ErrorBubble,
  MessageBubble,
  StarterPrompts,
  ThinkingBubble,
  type InsightChatMessage,
} from '@/features/insights/components/InsightsChatPanels'
import { useAskInsight } from '@/features/insights/hooks/useAskInsight'
import { useEffect, useRef, useState } from 'react'

let messageIdCounter = 0
function nextId() {
  messageIdCounter += 1
  return String(messageIdCounter)
}

type Props = {
  onClose: () => void
}

export function InsightsChat({ onClose }: Props) {
  const [messages, setMessages] = useState<InsightChatMessage[]>([])
  const [input, setInput] = useState('')
  const [pendingUserInput, setPendingUserInput] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const mutation = useAskInsight()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, mutation.isPending])

  function sendMessage(prompt: string) {
    const trimmed = prompt.trim()
    if (!trimmed || mutation.isPending) return

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: trimmed }])
    setInput('')
    setPendingUserInput(trimmed)
  }

  useEffect(() => {
    if (pendingUserInput === null) return

    const history = messages
      .slice(0, -1)
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }))

    mutation.mutate(
      { prompt: pendingUserInput, history },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { id: nextId(), role: 'assistant', content: data.answer, usedTools: data.usedTools },
          ])
          setPendingUserInput(null)
        },
        onError: () => {
          setPendingUserInput(null)
        },
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingUserInput])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function handleClear() {
    setMessages([])
    setInput('')
    setPendingUserInput(null)
    mutation.reset()
  }

  function handleEditAndRetry() {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUserMsg) {
      mutation.reset()
      setInput(lastUserMsg.content)
      textareaRef.current?.focus()
    }
  }

  const hasMessages = messages.length > 0
  const mutationError = mutation.error instanceof Error ? mutation.error : null

  return (
    <div className='flex h-full flex-col'>
      <ChatHeader hasMessages={hasMessages} onClear={handleClear} onClose={onClose} />

      <div className='min-h-0 flex-1 overflow-y-auto px-4 py-3'>
        {!hasMessages ? (
          <StarterPrompts disabled={mutation.isPending} onSelect={sendMessage} />
        ) : (
          <div className='space-y-3'>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {mutation.isPending ? <ThinkingBubble /> : null}

            {mutation.isError && !mutation.isPending ? (
              <ErrorBubble error={mutationError} onEditAndRetry={handleEditAndRetry} />
            ) : null}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <p className='border-t border-zinc-100 px-4 py-1.5 text-[10px] leading-relaxed text-zinc-400'>
        AI insights are informational and based on available demo data.
      </p>

      <ChatInput
        value={input}
        isPending={mutation.isPending}
        textareaRef={textareaRef}
        onChange={setInput}
        onKeyDown={handleKeyDown}
        onSend={() => sendMessage(input)}
      />
    </div>
  )
}
