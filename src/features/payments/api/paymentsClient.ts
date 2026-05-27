import type {
  PaymentPreviewInput,
  PaymentPreviewResponse,
  PaymentsOptionsResponse,
  PaymentSubmitInput,
  PaymentSubmitResponse,
} from '@/features/payments/types'

type PaymentsApiErrorBody = {
  error?: {
    code?: string
    message?: string
  }
}

export class PaymentsRequestError extends Error {
  status: number
  code: string | null

  constructor(message: string, status: number, code: string | null = null) {
    super(message)
    this.name = 'PaymentsRequestError'
    this.status = status
    this.code = code
  }
}

async function readPaymentsJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  const body = (await response.json().catch(() => null)) as T | PaymentsApiErrorBody | null

  if (!response.ok) {
    const code =
      body && typeof body === 'object' && 'error' in body && body.error?.code
        ? body.error.code
        : null
    const message =
      body && typeof body === 'object' && 'error' in body && body.error?.message
        ? body.error.message
        : fallbackMessage

    throw new PaymentsRequestError(message, response.status, code)
  }

  return body as T
}

export async function fetchPaymentOptions(): Promise<PaymentsOptionsResponse> {
  const response = await fetch('/api/payments/options', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  return readPaymentsJson<PaymentsOptionsResponse>(response, 'Unable to load payment options')
}

export async function previewPayment(input: PaymentPreviewInput): Promise<PaymentPreviewResponse> {
  const response = await fetch('/api/payments/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  return readPaymentsJson<PaymentPreviewResponse>(response, 'Unable to generate payment preview')
}

export async function submitPayment(input: PaymentSubmitInput): Promise<PaymentSubmitResponse> {
  const response = await fetch('/api/payments/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  return readPaymentsJson<PaymentSubmitResponse>(response, 'Unable to submit payment')
}
