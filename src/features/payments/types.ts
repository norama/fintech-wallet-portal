export type {
  FxRate,
  PaymentAmount,
  PaymentPreviewResponse,
  PaymentPreviewSource,
  PaymentPreviewTarget,
  PaymentsOptionsResponse,
  PaymentSubmitResponse,
  PaymentSubmitTransactionItem,
  PaymentsWallet,
  PaymentType,
} from '@/lib/types/api'

// Client-side input shapes sent to the API

export type PreviewExternalTransferInput = {
  paymentType: 'external_transfer'
  sourceWalletId: string
  amountMinor: number
  recipientAccountRef: string
  recipientName?: string
  paymentNote?: string
}

export type PreviewOwnWalletTransferInput = {
  paymentType: 'own_wallet_transfer'
  sourceWalletId: string
  amountMinor: number
  targetWalletId: string
  paymentNote?: string
}

export type PaymentPreviewInput = PreviewExternalTransferInput | PreviewOwnWalletTransferInput

export type SubmitExternalTransferInput = PreviewExternalTransferInput & {
  authorizationCode?: string
}

export type SubmitOwnWalletTransferInput = PreviewOwnWalletTransferInput

export type PaymentSubmitInput = SubmitExternalTransferInput | SubmitOwnWalletTransferInput
