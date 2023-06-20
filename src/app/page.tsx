'use client'
import useAppStore from '@/store/UserStore'
import React from 'react'

import GoogleLoginWrapper from '@/components/GoogleLoginWrapper'
import NavBar from '@/components/NavBar'
import SideMenu from '@/components/SideMenu'

const HomePage = () => {
  const user = useAppStore((s) => s.user)
  if (!user) {
    return (
      <Wrapper>
        <div></div>
      </Wrapper>
    )
  }
  return (
    <Wrapper>
      <div className="p-2 m-2 h-full">
        <div className="flex items-center justify-center p-4 text-center">
          <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="text-lg font-medium leading-6 text-gray-900">
              Thank you for login.
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}

const Wrapper = ({ children }: { children: JSX.Element }) => {
  return (
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
  )
}

export default HomePage
