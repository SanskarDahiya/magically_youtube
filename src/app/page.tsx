'use client'
import useAppStore from '@/store/UserStore'
import React from 'react'
import { Dialog, Transition } from '@headlessui/react'

const HomePage = () => {
  const user = useAppStore((s) => s.user)
  if (!user) {
    return null
  }
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

export default HomePage
