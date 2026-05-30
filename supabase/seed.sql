insert into accounts (
  id,
  display_name,
  account_type,
  verification_status
)
values
  (
    'a1000000-0000-4000-8000-000000000001',
    'Alice Novak',
    'individual',
    'verified'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'Bob Smith',
    'individual',
    'verified'
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'Cecile Martin',
    'individual',
    'verified'
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    'David Brown',
    'individual',
    'verified'
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    'Eva Klein',
    'individual',
    'pending_review'
  ),
  (
    'a1000000-0000-4000-8000-000000000006',
    'Filip Novak',
    'individual',
    'verified'
  ),
  (
    'a1000000-0000-4000-8000-000000000007',
    'Acme Supplies s.r.o.',
    'business',
    'verified'
  ),
  (
    'a1000000-0000-4000-8000-000000000008',
    'Blue River Trading Ltd.',
    'business',
    'verified'
  ),
  (
    'a1000000-0000-4000-8000-000000000009',
    'CloudWorks Studio',
    'business',
    'verified'
  ),
  (
    'a1000000-0000-4000-8000-000000000010',
    'Delta Services a.s.',
    'business',
    'pending_review'
  ),
  (
    'a1000000-0000-4000-8000-000000000011',
    'Evergreen Market',
    'business',
    'verified'
  ),
  (
    'a1000000-0000-4000-8000-000000000012',
    'FuturePay Labs',
    'business',
    'restricted'
  )
on conflict (id) do nothing;

insert into users (
  id,
  account_id,
  email,
  full_name,
  role,
  status
)
values
  (
    'b1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'alice@test.com',
    'Alice Novak',
    'owner',
    'active'
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000002',
    'bob@test.com',
    'Bob Smith',
    'owner',
    'active'
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    'a1000000-0000-4000-8000-000000000003',
    'cecile@test.com',
    'Cecile Martin',
    'owner',
    'active'
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    'a1000000-0000-4000-8000-000000000004',
    'david@test.com',
    'David Brown',
    'owner',
    'active'
  ),
  (
    'b1000000-0000-4000-8000-000000000005',
    'a1000000-0000-4000-8000-000000000005',
    'eva@test.com',
    'Eva Klein',
    'owner',
    'active'
  ),
  (
    'b1000000-0000-4000-8000-000000000006',
    'a1000000-0000-4000-8000-000000000006',
    'filip@test.com',
    'Filip Novak',
    'owner',
    'active'
  ),
  (
    'b1000000-0000-4000-8000-000000000007',
    'a1000000-0000-4000-8000-000000000007',
    'acme@test.com',
    'Acme Finance',
    'finance_manager',
    'active'
  ),
  (
    'b1000000-0000-4000-8000-000000000008',
    'a1000000-0000-4000-8000-000000000008',
    'blue@test.com',
    'Blue River Finance',
    'finance_manager',
    'active'
  ),
  (
    'b1000000-0000-4000-8000-000000000009',
    'a1000000-0000-4000-8000-000000000009',
    'cloud@test.com',
    'CloudWorks Finance',
    'finance_manager',
    'active'
  ),
  (
    'b1000000-0000-4000-8000-000000000010',
    'a1000000-0000-4000-8000-000000000010',
    'delta@test.com',
    'Delta Finance',
    'finance_manager',
    'active'
  ),
  (
    'b1000000-0000-4000-8000-000000000011',
    'a1000000-0000-4000-8000-000000000011',
    'evergreen@test.com',
    'Evergreen Finance',
    'finance_manager',
    'active'
  ),
  (
    'b1000000-0000-4000-8000-000000000012',
    'a1000000-0000-4000-8000-000000000012',
    'future@test.com',
    'FuturePay Finance',
    'finance_manager',
    'active'
  )
on conflict (id) do nothing;


-- Some initial wallets with non-zero balances for testing/demo purposes.

insert into wallets (
  id,
  account_id,
  name,
  currency,
  balance_minor,
  available_balance_minor,
  reserved_balance_minor,
  status,
  is_primary
)
values
  -- Alice Novak
  (
    'c1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'Alice EUR Wallet',
    'EUR',
    245000,
    245000,
    0,
    'active',
    true
  ),
  (
    'c1000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000001',
    'Alice CZK Wallet',
    'CZK',
    1850000,
    1850000,
    0,
    'active',
    true
  ),

  -- Bob Smith
  (
    'c1000000-0000-4000-8000-000000000003',
    'a1000000-0000-4000-8000-000000000002',
    'Bob EUR Wallet',
    'EUR',
    520000,
    500000,
    20000,
    'active',
    true
  ),
  (
    'c1000000-0000-4000-8000-000000000004',
    'a1000000-0000-4000-8000-000000000002',
    'Bob USD Wallet',
    'USD',
    120000,
    120000,
    0,
    'active',
    true
  ),

  -- Cecile Martin
  (
    'c1000000-0000-4000-8000-000000000005',
    'a1000000-0000-4000-8000-000000000003',
    'Cecile EUR Wallet',
    'EUR',
    98000,
    98000,
    0,
    'active',
    true
  ),
  (
    'c1000000-0000-4000-8000-000000000006',
    'a1000000-0000-4000-8000-000000000003',
    'Cecile CZK Wallet',
    'CZK',
    4250000,
    4000000,
    250000,
    'limited',
    true
  )
on conflict (id) do nothing;