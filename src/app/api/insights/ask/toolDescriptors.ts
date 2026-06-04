import type { Tool } from 'openai/resources/responses/responses'

export const TOOLS: Tool[] = [
  {
    type: 'function',
    name: 'get_wallet_summary',
    description:
      'Get wallet balances, available funds, reserved funds, wallet statuses, and primary wallet information for the authenticated account.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
    strict: true,
  },

  {
    type: 'function',
    name: 'get_recent_transactions',
    description:
      'Get recent transactions for the authenticated account. Supports filtering by status, direction, currency, and date range.',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: ['number', 'null'],
          description:
            'Maximum number of transactions to return. Use null for default 20. Maximum 50.',
        },
        status: {
          type: ['string', 'null'],
          enum: ['completed', 'pending', 'failed', 'reversed', 'requires_review', null],
          description: 'Filter by transaction status. Use null for no status filter.',
        },
        direction: {
          type: ['string', 'null'],
          enum: ['incoming', 'outgoing', null],
          description: 'Filter by transaction direction. Use null for no direction filter.',
        },
        currency: {
          type: ['string', 'null'],
          enum: ['EUR', 'CZK', 'USD', 'GBP', null],
          description: 'Filter by transaction currency. Use null for no currency filter.',
        },
        dateFrom: {
          type: ['string', 'null'],
          description:
            'Start date in YYYY-MM-DD format, for example 2026-05-01. Use null for no start date.',
        },
        dateTo: {
          type: ['string', 'null'],
          description:
            'End date in YYYY-MM-DD format, for example 2026-05-31. Use null for no end date.',
        },
      },
      required: ['limit', 'status', 'direction', 'currency', 'dateFrom', 'dateTo'],
      additionalProperties: false,
    },
    strict: true,
  },

  {
    type: 'function',
    name: 'get_transaction_totals',
    description:
      'Get aggregated transaction statistics and totals for a date range. Useful for summaries, spending analysis, and operational reporting.',
    parameters: {
      type: 'object',
      properties: {
        currency: {
          type: ['string', 'null'],
          enum: ['EUR', 'CZK', 'USD', 'GBP', null],
          description: 'Optional currency filter. Use null for all currencies.',
        },
        dateFrom: {
          type: ['string', 'null'],
          description:
            'Start date in YYYY-MM-DD format, for example 2026-05-01. Use null to use the default date range.',
        },
        dateTo: {
          type: ['string', 'null'],
          description:
            'End date in YYYY-MM-DD format, for example 2026-05-31. Use null to use the default date range.',
        },
      },
      required: ['currency', 'dateFrom', 'dateTo'],
      additionalProperties: false,
    },
    strict: true,
  },

  {
    type: 'function',
    name: 'get_attention_items',
    description:
      'Get transactions and wallets that require attention, including pending transactions, transactions requiring review, failed transactions, and wallets with limited or suspended status.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
    strict: true,
  },
]
