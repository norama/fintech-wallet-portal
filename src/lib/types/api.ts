import type {
  AccountRow,
  AccountType,
  AccountVerificationStatus,
  CounterpartyType,
  CurrencyCode,
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

export type DashboardAccount = {
  id: AccountRow['id']
  displayName: AccountRow['display_name']
  accountType: AccountType
  verificationStatus: AccountVerificationStatus
  createdAt: AccountRow['created_at']
}

export type DashboardWallet = {
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

export type DashboardTransaction = {
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
  createdAt: string
  completedAt: string | null
}

export type DashboardResponse = {
  user: BasicUserInfo
  account: DashboardAccount | null
  wallets: DashboardWallet[]
  transactions: DashboardTransaction[]
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

export type StartSignInResponse = {
  challengeId: string
  user: AuthUserResponse
}

export type VerifyCodeResponse = {
  user: AuthUserResponse
}
