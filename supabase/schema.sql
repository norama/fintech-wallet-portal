-- Enable UUID generation if not already enabled.
create extension if not exists "pgcrypto";

-- Optional: clean reset during early development.
-- Be careful: this deletes existing data.
drop table if exists sign_in_challenges cascade;
drop table if exists transactions cascade;
drop table if exists wallets cascade;
drop table if exists users cascade;
drop table if exists accounts cascade;

create table accounts (
  id uuid primary key default gen_random_uuid(),

  display_name text not null,

  account_type text not null
    check (account_type in ('individual', 'business')),

  verification_status text not null
    check (verification_status in ('verified', 'pending_review', 'restricted')),

  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),

  account_id uuid not null
    references accounts(id)
    on delete cascade,

  email text not null unique,
  full_name text not null,

  role text not null
    check (role in ('owner', 'finance_manager', 'viewer', 'admin')),

  status text not null
    check (status in ('active', 'disabled')),

  created_at timestamptz not null default now()
);

create table wallets (
  id uuid primary key default gen_random_uuid(),

  account_id uuid not null
    references accounts(id)
    on delete cascade,

  name text not null,

  currency text not null
    check (currency in ('EUR', 'CZK', 'USD', 'GBP')),

  balance_minor bigint not null
    check (balance_minor >= 0),

  available_balance_minor bigint not null
    check (available_balance_minor >= 0),

  reserved_balance_minor bigint not null default 0
    check (reserved_balance_minor >= 0),

  status text not null
    check (status in ('active', 'limited', 'suspended')),

  created_at timestamptz not null default now(),

  is_primary boolean not null default false,

  constraint wallets_balance_consistency
    check (balance_minor >= available_balance_minor)
);

create table transactions (
  id uuid primary key default gen_random_uuid(),

  account_id uuid not null
    references accounts(id)
    on delete cascade,

  wallet_id uuid not null
    references wallets(id)
    on delete cascade,

  direction text not null
    check (direction in ('incoming', 'outgoing')),

  transaction_type text not null
    check (
      transaction_type in (
        'bank_transfer',
        'internal_transfer',
        'card_payment',
        'fee',
        'fx_conversion'
      )
    ),

  counterparty_type text not null
    check (
      counterparty_type in (
        'external_account',
        'internal_wallet',
        'card_merchant',
        'platform',
        'fx'
      )
    ),

  counterparty_name text not null,

  -- Generic reference:
  -- external account IBAN/masked account, internal wallet ID, card ref, FX pair, etc.
  counterparty_ref text,

  amount_minor bigint not null
    check (amount_minor >= 0),

  currency text not null
    check (currency in ('EUR', 'CZK', 'USD', 'GBP')),

  status text not null
    check (
      status in (
        'completed',
        'pending',
        'failed',
        'reversed',
        'requires_review'
      )
    ),

  reference text not null,

  payment_note text,

  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table sign_in_challenges (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references users(id)
    on delete cascade,

  method text not null
    check (method in ('mobile_app_code')),

  expires_at timestamptz not null,
  consumed_at timestamptz,

  attempts integer not null default 0
    check (attempts >= 0),

  created_at timestamptz not null default now()
);

create table payment_contacts (
  id uuid primary key default gen_random_uuid(),

  owner_account_id uuid not null
    references accounts(id)
    on delete cascade,

  target_account_id uuid not null
    references accounts(id)
    on delete cascade,

  nickname text not null,

  status text not null default 'active'
    check (status in ('active', 'blocked')),

  created_at timestamptz not null default now(),

  constraint payment_contacts_not_self
    check (owner_account_id <> target_account_id),

  constraint payment_contacts_unique_target
    unique (owner_account_id, target_account_id)
);

-- Indexes for common route-handler queries.

create index users_account_id_idx
  on users(account_id);

create index users_email_idx
  on users(email);

create index wallets_account_id_idx
  on wallets(account_id);

create unique index wallets_primary_per_currency_unique
  on wallets(account_id, currency)
  where is_primary = true;

create index transactions_account_id_idx
  on transactions(account_id);

create index transactions_wallet_id_idx
  on transactions(wallet_id);

create index transactions_created_at_idx
  on transactions(created_at desc);

create index sign_in_challenges_user_id_idx
  on sign_in_challenges(user_id);

create index sign_in_challenges_expires_at_idx
  on sign_in_challenges(expires_at);

create index payment_contacts_owner_account_id_idx
  on payment_contacts(owner_account_id);

create index payment_contacts_target_account_id_idx
  on payment_contacts(target_account_id);


-- Enable Row Level Security.
-- In this demo, Next.js route handlers use the server-side secret/service key.
-- The frontend should not access Supabase directly.

alter table accounts enable row level security;
alter table users enable row level security;
alter table wallets enable row level security;
alter table transactions enable row level security;
alter table sign_in_challenges enable row level security;
alter table payment_contacts enable row level security;
