type InsightsApiErrorBody = {
  error?: {
    code?: string
    message?: string
  }
}

export type AskInsightHistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AskInsightRequest = {
  prompt: string
  history?: AskInsightHistoryMessage[]
}

export type AskInsightResponse = {
  answer: string
  usedTools: string[]
}

async function readInsightsJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as T | InsightsApiErrorBody | null

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && body.error?.message
        ? body.error.message
        : 'AI Insights request failed'
    throw new Error(message)
  }

  return body as T
}

export async function askInsight(input: AskInsightRequest): Promise<AskInsightResponse> {
  const response = await fetch('/api/insights/ask', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return readInsightsJson<AskInsightResponse>(response)
}
