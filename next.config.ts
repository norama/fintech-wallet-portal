import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'langchain',
    '@langchain/core',
    '@langchain/langgraph',
    '@langchain/openai',
    'openai',
  ],
  outputFileTracingIncludes: {
    '/api/insights/ask': [
      './node_modules/langchain/**/*',
      './node_modules/@langchain/core/**/*',
      './node_modules/@langchain/langgraph/**/*',
      './node_modules/@langchain/openai/**/*',
      './node_modules/openai/**/*',
    ],
  },
}

export default nextConfig
