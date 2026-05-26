export type CurrencyCode = 'EUR' | 'CZK' | 'USD' | 'GBP'

export type AccountType = 'individual' | 'business'
export type AccountVerificationStatus = 'verified' | 'pending_review' | 'restricted'

export type UserRole = 'owner' | 'finance_manager' | 'viewer' | 'admin'
export type UserStatus = 'active' | 'disabled'

export type WalletStatus = 'active' | 'limited' | 'suspended'

export type TransactionDirection = 'incoming' | 'outgoing'
export type TransactionType =
  | 'bank_transfer'
  | 'internal_transfer'
  | 'card_payment'
  | 'fee'
  | 'fx_conversion'
export type CounterpartyType =
  | 'external_account'
  | 'internal_wallet'
  | 'card_merchant'
  | 'platform'
  | 'fx'
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'reversed' | 'requires_review'

export type SignInChallengeMethod = 'mobile_app_code'

export type AccountRow = {
  id: string
  display_name: string
  account_type: AccountType
  verification_status: AccountVerificationStatus
  created_at: string
}

export type UserRow = {
  id: string
  account_id: string
  email: string
  full_name: string
  role: UserRole
  status: UserStatus
  created_at: string
}

export type WalletRow = {
  id: string
  account_id: string
  name: string
  currency: CurrencyCode
  balance_minor: number
  available_balance_minor: number
  reserved_balance_minor: number
  status: WalletStatus
  created_at: string
}

export type TransactionRow = {
  id: string
  account_id: string
  wallet_id: string
  direction: TransactionDirection
  transaction_type: TransactionType
  counterparty_type: CounterpartyType
  counterparty_name: string
  counterparty_ref: string | null
  amount_minor: number
  currency: CurrencyCode
  status: TransactionStatus
  reference: string
  payment_note: string | null
  created_at: string
  completed_at: string | null
}

export type SignInChallengeRow = {
  id: string
  user_id: string
  method: SignInChallengeMethod
  expires_at: string
  consumed_at: string | null
  attempts: number
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: AccountRow
        Insert: Omit<AccountRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<AccountRow>
        Relationships: []
      }
      users: {
        Row: UserRow
        Insert: Omit<UserRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<UserRow>
        Relationships: [
          {
            foreignKeyName: 'users_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
        ]
      }
      wallets: {
        Row: WalletRow
        Insert: Omit<WalletRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<WalletRow>
        Relationships: [
          {
            foreignKeyName: 'wallets_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
        ]
      }
      transactions: {
        Row: TransactionRow
        Insert: Omit<TransactionRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<TransactionRow>
        Relationships: [
          {
            foreignKeyName: 'transactions_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_wallet_id_fkey'
            columns: ['wallet_id']
            isOneToOne: false
            referencedRelation: 'wallets'
            referencedColumns: ['id']
          },
        ]
      }
      sign_in_challenges: {
        Row: SignInChallengeRow
        Insert: Omit<SignInChallengeRow, 'id' | 'consumed_at' | 'attempts' | 'created_at'> & {
          id?: string
          consumed_at?: string | null
          attempts?: number
          created_at?: string
        }
        Update: Partial<SignInChallengeRow>
        Relationships: [
          {
            foreignKeyName: 'sign_in_challenges_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
  }
}
