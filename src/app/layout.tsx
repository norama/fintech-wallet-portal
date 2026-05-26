import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { AppQueryProvider } from '@/components/providers/AppQueryProvider'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Fintech Wallet Portal',
  description:
    'Fintech Wallet Portal is a demo application showcasing a wallet management dashboard built with Next.js and React.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className='min-h-full flex flex-col'>
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  )
}
