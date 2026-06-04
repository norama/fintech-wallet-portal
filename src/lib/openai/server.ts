import 'server-only'

import OpenAI from 'openai'

export function createOpenAIServerClient() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('Missing OpenAI server environment variable')
  }

  return new OpenAI({ apiKey })
}
