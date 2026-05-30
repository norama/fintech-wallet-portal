# Fintech Wallet Portal

A frontend-focused fintech wallet / internet banking prototype built to demonstrate React + TypeScript architecture, API-driven UI, server-side validation, and product thinking for money movement workflows.

The current demo focuses on a wallet account experience with:

- banking-style sign-in flow
- account overview dashboard
- wallet balances
- transaction history with filtering and pagination
- payment creation flow
- server-side preview and submit validation
- Supabase-backed persistence behind Next.js API routes

This is not a production banking system. The goal is to demonstrate frontend architecture, UX, and API collaboration patterns in a realistic fintech domain.

---

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Supabase Postgres
- Next.js Route Handlers

Supabase is used only from server-side route handlers. Client components do not access Supabase directly.

---

## Demo Scope

### Implemented

#### Authentication

A simplified banking-style sign-in flow:

1. User enters email / client identifier.
2. Server creates a sign-in challenge.
3. User enters a verification code.
4. Server creates a demo session cookie.
5. Authenticated routes use the session cookie.

Authentication is intentionally mocked. In a real product, this would be delegated to a secure identity provider or banking authentication backend.

#### Overview Dashboard

The dashboard shows:

- authenticated account context
- verification / account status
- wallet balance cards
- available and reserved balances
- operational alerts
- recent transaction activity
- activity summary

#### Transactions

The transaction page is a server-driven data view with:

- server-side pagination
- server-side filtering
- search
- URL-based filter state
- status, type, wallet, and direction filters
- expandable transaction details
- loading, error, and empty states

Transactions are modeled as wallet statement entries.

#### Payments

The new payment flow currently supports:

1. External transfer
2. Transfer between own wallets

The flow has three steps:

1. Input
2. Server-generated preview
3. Submit / result

The payment submit endpoint updates wallet balances and creates transaction rows. External transfers are submitted as pending transactions; own-wallet transfers complete immediately and create two matching transaction rows.

---

## Domain Model

The main tables are:

- `accounts`
- `users`
- `wallets`
- `transactions`
- `sign_in_challenges`

Current simplification:

- one user belongs to one account
- accounts may represent either an individual or a business
- transactions are account-scoped and wallet-scoped
- money values are stored in minor units, for example cents
- external payment authorization and authentication are mocked

### Transactions

A transaction row represents a wallet statement entry.

Important fields include:

- `wallet_id`
- `account_id`
- `direction`
- `transaction_type`
- `counterparty_type`
- `counterparty_name`
- `counterparty_ref`
- `amount_minor`
- `currency`
- `status`
- `reference`
- `payment_note`

For own-wallet transfers, two transaction rows are created with the same generated reference:

- outgoing row on the source wallet
- incoming row on the target wallet

---

## API Architecture

The frontend talks to Next.js API routes, not directly to Supabase.

```txt
Client UI
  → typed client API functions
  → Next.js route handlers
  → Supabase Postgres
```

Implemented route groups include:

- /api/auth/\*
- /api/dashboard
- /api/transactions
- /api/payments/options
- /api/payments/preview
- /api/payments/submit

Server routes validate input with Zod and scope data to the authenticated account.

Demo Credentials

- E-mail: finance@corp.com
- Verification code: 123456

The verification code is demo-only and represents a banking-style mobile app / authenticator confirmation.

Local Development

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```txt
SUPABASE_URL=your_supabase_project_url
SUPABASE_SECRET_KEY=your_supabase_secret_key
```

Run the development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

## Project Goals

This project is designed to show:

- reusable UI structure
- typed API boundaries
- server-driven data views
- form validation
- loading, error, and empty states
- fintech-oriented UX
- money movement modeling
- backend collaboration mindset

## Current Limitations

This is a demo prototype. Some intentionally simplified areas:

- authentication is mocked
- session handling is demo-only
- FX rates are mocked
- no real banking compliance workflow
- no payment approval workflow yet
- wallets and contacts are returned as part of payment options - in a production-scale system, contacts would be searched server-side with pagination/typeahead rather than preloaded into the payment form.

## Possible Next Improvements

Planned or possible additions:

- date based filtering
- custom sorting
- payment request / operation history table
- payment approval workflow
- audit timeline
- role-based permissions
- improved session model
- more complete design system
