import GoogleLoginWrapper from '@/components/GoogleLoginWrapper'
import NavBar from '@/components/NavBar'
import SideMenu from '@/components/SideMenu'

export const metadata = {
  title: 'Youtube Info',
  description: 'Get Youtube Info',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GoogleLoginWrapper>
      <div className="grid grid-cols-6 md:grid-cols-10 gap-0 h-full">
        <div className="col-span-1 md:col-span-1 lg:col-span-2">
          <SideMenu />
        </div>
        <div className="col-span-5 md:col-span-9 lg:col-span-8 h-full">
          <div className="relative">
            <NavBar />
            <div className="overflow-y-auto h-screen flex flex-col bg-black">
              <div className="flex-shrink-0 p-5" style={{ marginTop: 72 }}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleLoginWrapper>
  )
}
