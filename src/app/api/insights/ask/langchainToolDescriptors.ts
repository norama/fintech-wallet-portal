import {
  getAttentionItems,
  getCurrencyConversionRates,
  getRecentTransactions,
  getTransactionTotals,
  getWalletSummary,
} from '@/lib/insights/tools'
import { ClientTool } from '@langchain/core/tools'
import { tool } from 'langchain'
import * as z from 'zod'

const currencySchema = z.enum(['EUR', 'CZK', 'USD', 'GBP']).nullable()
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()

export const LANGCHAIN_TOOLS = [
  tool(async (_, config) => getWalletSummary(config.context.accountId), {
    name: 'get_wallet_summary',
    description:
      'Get wallet balances, available funds, reserved funds, wallet statuses, and primary wallet information for the authenticated account.',
    schema: z.object({}),
  }),

  tool(
    async (input: Parameters<typeof getRecentTransactions>[1], config) =>
      getRecentTransactions(config.context.accountId, input),
    {
      name: 'get_recent_transactions',
      description:
        'Get recent transactions for the authenticated account. Supports filtering by status, direction, currency, and date range.',
      schema: z.object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .nullable()
          .describe(
            'Maximum number of transactions to return. Use null for default 20. Maximum 50.',
          ),
        status: z
          .enum(['completed', 'pending', 'failed', 'reversed', 'requires_review'])
          .nullable()
          .describe('Filter by transaction status. Use null for no status filter.'),
        direction: z
          .enum(['incoming', 'outgoing'])
          .nullable()
          .describe('Filter by transaction direction. Use null for no direction filter.'),
        currency: currencySchema.describe(
          'Filter by transaction currency. Use null for no currency filter.',
        ),
        dateFrom: dateSchema.describe(
          'Start date in YYYY-MM-DD format, for example 2026-05-01. Use null for no start date.',
        ),
        dateTo: dateSchema.describe(
          'End date in YYYY-MM-DD format, for example 2026-05-31. Use null for no end date.',
        ),
      }),
    },
  ),

  tool(
    async (input: Parameters<typeof getTransactionTotals>[1], config) =>
      getTransactionTotals(config.context.accountId, input),
    {
      name: 'get_transaction_totals',
      description:
        'Get aggregated transaction statistics and totals for a date range. Useful for summaries, spending analysis, and operational reporting.',
      schema: z.object({
        currency: currencySchema.describe('Optional currency filter. Use null for all currencies.'),
        dateFrom: dateSchema.describe(
          'Start date in YYYY-MM-DD format, for example 2026-05-01. Use null to use the default date range.',
        ),
        dateTo: dateSchema.describe(
          'End date in YYYY-MM-DD format, for example 2026-05-31. Use null to use the default date range.',
        ),
      }),
    },
  ),

  tool(async (_, config) => getAttentionItems(config.context.accountId), {
    name: 'get_attention_items',
    description:
      'Get transactions and wallets that require attention, including pending transactions, transactions requiring review, failed transactions, and wallets with limited or suspended status.',
    schema: z.object({}),
  }),

  tool(getCurrencyConversionRates, {
    name: 'get_fx_rates',
    description:
      'Get mocked FX rates used by the demo for currency conversion between supported wallet currencies.',
    schema: z.object({}),
  }),
] as ClientTool[]
