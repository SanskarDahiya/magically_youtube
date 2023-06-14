import './globals.css'
import { Inter } from 'next/font/google'
import GoogleLoginWrapper from '@/components/GoogleLoginWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Youtube Info',
  description: 'Get Youtube Info',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className + ' min-h-screen'}>
        <GoogleLoginWrapper>{children}</GoogleLoginWrapper>
      </body>
    </html>
  )
}
