import type {
  AccountRow,
  AccountType,
  AccountVerificationStatus,
  CounterpartyType,
  CurrencyCode,
  PaymentContactStatus,
  TransactionDirection,
  TransactionStatus,
  TransactionType,
  UserRole,
  WalletRow,
  WalletStatus,
} from '@/lib/supabase/database.types'

export type BasicUserInfo = {
  id: string
  email: string | null
  accountId: string | null
  fullName: string | null
  role: UserRole | null
}

export type AuthUserResponse = BasicUserInfo

export type OverviewAccount = {
  id: AccountRow['id']
  displayName: AccountRow['display_name']
  accountType: AccountType
  verificationStatus: AccountVerificationStatus
  createdAt: AccountRow['created_at']
}

export type OverviewWallet = {
  id: string
  accountId: string
  name: string
  currency: CurrencyCode
  balanceMinor: number
  availableBalanceMinor: number
  reservedBalanceMinor: number
  status: WalletStatus
  createdAt: string
}

export type OverviewTransaction = {
  id: string
  accountId: string
  walletId: string
  direction: TransactionDirection
  transactionType: TransactionType
  counterpartyType: CounterpartyType
  counterpartyName: string
  counterpartyRef: string | null
  amountMinor: number
  currency: CurrencyCode
  status: TransactionStatus
  reference: string
  paymentNote: string | null
  createdAt: string
  completedAt: string | null
}

export type OverviewResponse = {
  user: BasicUserInfo
  account: OverviewAccount | null
  wallets: OverviewWallet[]
  transactions: OverviewTransaction[]
}

export type TransactionsListItem = {
  id: string
  accountId: string
  walletId: string
  walletName: string | null
  direction: TransactionDirection
  transactionType: TransactionType
  counterpartyType: CounterpartyType
  counterpartyName: string
  counterpartyRef: string | null
  amountMinor: number
  currency: CurrencyCode
  status: TransactionStatus
  reference: string
  paymentNote: string | null
  createdAt: string
  completedAt: string | null
}

export type TransactionsFilterWallet = {
  id: WalletRow['id']
  name: WalletRow['name']
  currency: WalletRow['currency']
  status: WalletRow['status']
}

export type TransactionsListResponse = {
  items: TransactionsListItem[]
  page: number
  pageSize: number
  totalCount: number
  pageCount: number
  filters: {
    wallets: TransactionsFilterWallet[]
  }
}

export type WalletsListItem = {
  id: string
  name: string
  currency: CurrencyCode
  balanceMinor: number
  availableBalanceMinor: number
  reservedBalanceMinor: number
  status: WalletStatus
  isPrimary: boolean
  createdAt: string
}

export type WalletsSummary = {
  totalWallets: number
  activeWallets: number
  limitedWallets: number
  suspendedWallets: number
  currencies: CurrencyCode[]
  totalReservedByCurrency: Partial<Record<CurrencyCode, number>>
}

export type WalletsListResponse = {
  items: WalletsListItem[]
  summary: WalletsSummary
  page: number
  pageSize: number
  totalCount: number
  pageCount: number
}

export type StartSignInResponse = {
  challengeId: string
  user: AuthUserResponse
}

export type VerifyCodeResponse = {
  user: AuthUserResponse
}

export type PaymentsWallet = {
  id: string
  name: string
  currency: CurrencyCode
  balanceMinor: number
  availableBalanceMinor: number
  reservedBalanceMinor: number
  status: WalletStatus
}

export type FxRate = {
  fromCurrency: CurrencyCode
  toCurrency: CurrencyCode
  rate: number
}

export type PaymentsContact = {
  id: string
  nickname: string
  targetAccount: {
    displayName: string
    accountType: 'individual' | 'business'
    verificationStatus: 'verified' | 'pending_review' | 'restricted'
  }
  availableCurrencies: CurrencyCode[]
}

export type PaymentsOptionsResponse = {
  wallets: PaymentsWallet[]
  fxRates: FxRate[]
  contacts: PaymentsContact[]
}

export type PaymentType = 'external_transfer' | 'own_wallet_transfer' | 'internal_contact_transfer'

export type PaymentPreviewSource = {
  walletId: string
  walletName: string
  currency: CurrencyCode
  availableBalanceMinor: number
  balanceAfterMinor: number
}

export type PaymentPreviewTarget = {
  type: 'external_account' | 'own_wallet' | 'contact_wallet'
  name: string | null
  ref: string
  currency: CurrencyCode
}

export type PaymentAmount = {
  amountMinor: number
  currency: CurrencyCode
}

export type PaymentPreviewResponse = {
  paymentType: PaymentType
  paymentNote: string | null
  source: PaymentPreviewSource
  target: PaymentPreviewTarget
  sendAmount: PaymentAmount
  receiveAmount: PaymentAmount
  exchangeRate: number | null
  estimatedStatus: 'pending' | 'completed'
  warnings: string[]
}

export type PaymentSubmitTransactionItem = {
  id: string
  walletId: string
  direction: TransactionDirection
  transactionType: TransactionType
  status: TransactionStatus
  amountMinor: number
  currency: CurrencyCode
  paymentNote: string | null
  reference: string
}

export type PaymentSubmitResponse = {
  status: 'pending' | 'completed'
  reference: string
  createdTransactions: PaymentSubmitTransactionItem[]
}

export type ContactsListItem = {
  id: string
  targetAccountId: string
  targetEmail: string
  targetCurrencies: CurrencyCode[]
  nickname: string
  status: PaymentContactStatus
  createdAt: string
}

export type ContactsListResponse = {
  items: ContactsListItem[]
  page: number
  pageSize: number
  totalCount: number
  pageCount: number
}
