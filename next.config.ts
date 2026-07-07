import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['langchain', '@langchain/core', '@langchain/langgraph', '@langchain/openai'],
  outputFileTracingIncludes: {
    '/api/insights/ask': ['./node_modules/@langchain/openai/**/*'],
  },
}

export default nextConfig
