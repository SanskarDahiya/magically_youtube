import './globals.css'
import { Inter } from 'next/font/google'
export { reportWebVitals } from 'next-axiom'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
