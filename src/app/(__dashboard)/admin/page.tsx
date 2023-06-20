'use client'
import React from 'react'
import YoutubeComWrapper from '@/components/YoutubeComWrapper'
import useAppStore from '@/store/UserStore'

const AdminPageComponent = () => {
  const isAdmin = useAppStore((s) => s.isAdmin && s.user)
  const user = useAppStore((s) => s.user)

  if (!user) {
    return null
  }

  if (!isAdmin) {
    return (
      <div className="p-2 m-2 h-full">
        <div className="flex items-center justify-center p-4 text-center">
          <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="text-lg font-medium leading-6 text-gray-900">
              Thank you for login.
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div
      className="p-2 m-2 h-full min-h-[50vh]"
      style={{
        cursor: isAdmin ? 'auto' : 'not-allowed',
        opacity: isAdmin ? 1 : 0.5,
      }}
    >
      <YoutubeComWrapper />
    </div>
  )
}

export default AdminPageComponent
