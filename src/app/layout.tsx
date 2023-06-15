import './globals.css'
import { Inter } from 'next/font/google'
import GoogleLoginWrapper from '@/components/GoogleLoginWrapper'
import NavBar from '@/components/NavBar'
import SideMenu from '@/components/SideMenu'

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
      <body className={inter.className}>
        <GoogleLoginWrapper>
          <div className="grid grid-cols-6 md:grid-cols-10 gap-0 h-full">
            <div className="col-span-1 md:col-span-1 lg:col-span-2">
              <SideMenu />
            </div>
            <div className="col-span-5 md:col-span-9 lg:col-span-8 h-full">
              <div className="relative">
                <NavBar />
                <div className="overflow-y-auto h-screen flex flex-col">
                  <div className="flex-shrink-0 p-5" style={{ marginTop: 72 }}>
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GoogleLoginWrapper>
      </body>
    </html>
  )
}
