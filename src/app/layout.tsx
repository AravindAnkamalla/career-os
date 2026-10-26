import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppLayout } from '@/components/layout/app-layout'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CareerOS — Personal Career Operating System',
  description: 'Organize your career development, job search, upskilling, and daily execution.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  )
}
