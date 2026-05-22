// src/lib/db/database.types.ts

export type CompanyRow = {
  id: string
  name: string
  kyc_status: 'verified' | 'pending_review' | 'restricted'
  created_at: string
}

export type AppUserRow = {
  id: string
  company_id: string
  email: string
  full_name: string
  role: 'finance_manager' | 'viewer' | 'admin'
  status: 'active' | 'disabled'
  created_at: string
}

export type WalletRow = {
  id: string
  company_id: string
  name: string
  currency: 'EUR' | 'CZK' | 'USD' | 'GBP'
  balance_minor: number
  available_balance_minor: number
  reserved_balance_minor: number
  status: 'active' | 'limited' | 'suspended'
  created_at: string
}

export type TransactionRow = {
  id: string
  company_id: string
  wallet_id: string
  type: 'incoming' | 'outgoing' | 'card_payment' | 'fx_conversion' | 'fee'
  status: 'completed' | 'pending' | 'failed' | 'reversed' | 'requires_review'
  counterparty_name: string
  amount_minor: number
  currency: 'EUR' | 'CZK' | 'USD' | 'GBP'
  reference: string
  created_at: string
  completed_at: string | null
}

export type SignInChallengeRow = {
  id: string
  user_id: string
  method: 'mobile_app_code'
  expires_at: string
  consumed_at: string | null
  attempts: number
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: CompanyRow
        Insert: Omit<CompanyRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<CompanyRow>
        Relationships: []
      }
      app_users: {
        Row: AppUserRow
        Insert: Omit<AppUserRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<AppUserRow>
        Relationships: [
          {
            foreignKeyName: 'app_users_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
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
            foreignKeyName: 'wallets_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
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
            foreignKeyName: 'transactions_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
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
            referencedRelation: 'app_users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
  }
}
