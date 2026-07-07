import { jsonError } from '@/lib/api/responses'
import { findActiveUserById } from '@/lib/auth/demoAuth'
import { readDemoSessionUserId } from '@/lib/auth/demoSession'
import { createOpenAILangchainAgent } from '@/lib/openai/langchainAgent'
import { createOpenAIServerClient } from '@/lib/openai/server'
import { ResponseInput, Tool } from 'openai/resources/responses/responses'
import z from 'zod'
import { buildLangchainInsightsSystemPrompt } from './langchainPrompts'
import { LANGCHAIN_TOOLS } from './langchainToolDescriptors'

export const dynamic = 'force-dynamic'

const insightHistoryMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(1000),
})

export const askInsightRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(1000),

  history: z.array(insightHistoryMessageSchema).max(10).default([]),
  threadId: z.uuid().default(() => crypto.randomUUID()),
})

//type AskInsightRequest = z.infer<typeof askInsightRequestSchema>
// type InsightHistoryMessage = AskInsightRequest['history'][number]

export async function POST(request: Request) {
  const sessionUserId = await readDemoSessionUserId()

  if (!sessionUserId) {
    return jsonError(401, 'UNAUTHORIZED', 'You must sign in first')
  }

  console.log('sessionUserId for insights request:', sessionUserId)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, 'INVALID_JSON', 'Request body must be valid JSON')
  }

  const parsed = askInsightRequestSchema.safeParse(body)

  console.log('Parsed insights request body:', parsed)
  if (!parsed.success) {
    return jsonError(400, 'VALIDATION_ERROR', 'Invalid insight request')
  }

  // history is not used in the LangChain implementation, but we keep it for backward compatibility
  const { prompt, /* history, */ threadId } = parsed.data

  try {
    const user = await findActiveUserById(sessionUserId)

    if (!user) {
      return jsonError(401, 'UNAUTHORIZED', 'Your session is no longer valid')
    }

    const accountId = user.account_id

    //const insight = await getInsightAnswer(accountId, prompt, history)
    const insight = await getLangchainInsightAnswer(accountId, threadId, prompt)

    return Response.json(insight)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load insights'
    return jsonError(500, 'INSIGHTS_LOAD_FAILED', message)
  }
}

async function getLangchainInsightAnswer(accountId: string, threadId: string, prompt: string) {
  const threadConfig = { configurable: { thread_id: threadId }, context: { accountId } }

  const today = new Date().toISOString().slice(0, 10)
  const agent = await createOpenAILangchainAgent(
    LANGCHAIN_TOOLS,
    buildLangchainInsightsSystemPrompt(today),
  )

  // Log objects, such as message history or state
  const state = await agent.getState(threadConfig)
  const priorMessageCount = ((state['values']['messages'] as unknown[]) ?? []).length
  console.log('Current thread state:', {
    thread_id: threadId,
    state,
    messageCount: priorMessageCount,
  })

  const result = await agent.invoke({ messages: [{ role: 'user', content: prompt }] }, threadConfig)
  const response = result.messages.at(-1)?.content

  const newMessages = result.messages.slice(priorMessageCount)
  return {
    answer: response ?? 'No answer generated',
    usedTools: newMessages.filter((msg) => msg.type === 'tool').map((msg) => msg.name),
  }
}

// OLD code, without LangChain, kept for reference. We may want to delete it later.
/*
async function getInsightAnswer(
  accountId: string,
  prompt: string,
  history: AskInsightRequest['history'],
) {
  const openai = createOpenAIServerClient()

  const model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'

  const today = new Date().toISOString().slice(0, 10)

  function buildInsightUserInput(prompt: string, history: InsightHistoryMessage[]) {
    return JSON.stringify(
      {
        conversationHistory: history,
        currentQuestion: prompt,
      },
      null,
      2,
    )
  }

  // 1. Create a running input list we will add to over time
  const input: ResponseInputItem[] = [
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: buildInsightUserInput(prompt, history),
        },
      ],
    },
  ]

  // 2. Prompt the model with tools defined
  let response = await openai.responses.create({
    model,
    instructions: buildInsightsSystemPrompt(today),
    tools: TOOLS,
    input,
  })

  // Preserve model output for the next turn
  input.push(...(response.output as unknown as ResponseInputItem[]))

  const usedTools: string[] = []

  // 3. Check if the model made any function calls and execute them
  for (const item of response.output) {
    if (item.type !== 'function_call') continue

    const toolInput = JSON.parse(item.arguments)

    let result: object | null = null

    switch (item.name) {
      case 'get_wallet_summary': {
        result = await getWalletSummary(accountId)
        break
      }

      case 'get_recent_transactions': {
        result = await getRecentTransactions(accountId, toolInput)
        break
      }

      case 'get_transaction_totals': {
        result = await getTransactionTotals(accountId, toolInput)
        break
      }

      case 'get_attention_items': {
        result = await getAttentionItems(accountId)
        break
      }

      case 'get_fx_rates': {
        result = await getFXRates()
        break
      }

      default: {
        input.push({
          type: 'function_call_output',
          call_id: item.call_id,
          output: JSON.stringify({
            error: `Unknown tool: ${item.name}`,
          }),
        })
        console.warn(`Unknown insight tool requested: ${item.name}`)
        break
      }
    }

    if (result) {
      // 4. Provide function call results to the model
      input.push({
        type: 'function_call_output',
        call_id: item.call_id,
        output: JSON.stringify(result),
      })
      usedTools.push(item.name)
    }
  }

  // If no tools were used, return the model's initial response without a follow-up call
  if (usedTools.length === 0) {
    return {
      answer: response.output_text,
      usedTools,
    }
  }

  // 5. Get final model response after tool calls
  response = await openai.responses.create({
    model,
    instructions: buildInsightsFinalAnswerPrompt(today),
    input,
  })

  return {
    answer: response.output_text,
    usedTools,
  }
}
*/

/**
 * Example GET endpoint for testing only.
 *
 * @returns sample response from a tool-augmented LLM call with the OpenAI SDK
 */
export async function GET() {
  try {
    const answer = await llmCallWithTools()

    return Response.json({ answer })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load insights'
    return jsonError(500, 'INSIGHTS_LOAD_FAILED', message)
  }
}

/**
 * Example function for testing only.
 *
 * @returns sample response from a tool-augmented LLM call with the OpenAI SDK
 */
async function llmCallWithTools() {
  const openai = createOpenAIServerClient()

  const model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'

  // 1. Define a list of callable tools for the model
  const tools: Tool[] = [
    {
      type: 'function',
      name: 'get_horoscope',
      description: "Get today's horoscope for an astrological sign.",
      parameters: {
        type: 'object',
        properties: {
          sign: {
            type: 'string',
            description: 'An astrological sign like Taurus or Aquarius',
          },
        },
        required: ['sign'],
        additionalProperties: false,
      },
      strict: true,
    },
  ]

  function getHoroscope(sign: string) {
    return `${sign}: Next Tuesday you will befriend a baby otter.`
  }

  // Create a running input list we will add to over time
  const input: ResponseInput = [
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: 'What is my horoscope? I am an Aquarius.',
        },
      ],
    },
  ]

  // 2. Prompt the model with tools defined
  let response = await openai.responses.create({
    model,
    tools,
    input,
  })

  // Preserve model output for the next turn
  input.push(...(response.output as unknown as ResponseInput))

  for (const item of response.output) {
    if (item.type !== 'function_call') continue

    if (item.name === 'get_horoscope') {
      // 3. Execute the function logic for get_horoscope
      const { sign } = JSON.parse(item.arguments)
      const horoscope = getHoroscope(sign)

      // 4. Provide function call results to the model
      input.push({
        type: 'function_call_output',
        call_id: item.call_id,
        output: horoscope,
      })
    }
  }

  console.log('Final input:')
  console.log(JSON.stringify(input, null, 2))

  response = await openai.responses.create({
    model,
    instructions: 'Respond only with a horoscope generated by a tool.',
    input,
  })

  return response.output_text
}
