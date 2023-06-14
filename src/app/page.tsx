'use client'
import LoginModal from '@/components/LoginButton'
import useUserStore from '@/store/UserStore'
import React from 'react'

const YTCall = () => {
  const user = useUserStore((s) => s.user)
  return (
    <div className="p-2 m-2 h-full min-h-[50vh]">
      <LoginModal />
      {user && 'Thank you for login.'}
    </div>
  )
}

export default YTCall
