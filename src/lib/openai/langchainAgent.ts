import { ClientTool } from '@langchain/core/tools'
import { MemorySaver } from '@langchain/langgraph'
import { createAgent, initChatModel } from 'langchain'
import z from 'zod'

const checkpointer = new MemorySaver()

const contextSchema = z.object({
  accountId: z.string(),
})

export async function createOpenAILangchainAgent(tools: ClientTool[], systemPrompt: string) {
  const openaiModel = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('Missing OpenAI server environment variable')
  }

  const model = await initChatModel(openaiModel, { apiKey })
  return createAgent({
    model,
    tools,
    contextSchema,
    checkpointer,
    systemPrompt,
  })
}
