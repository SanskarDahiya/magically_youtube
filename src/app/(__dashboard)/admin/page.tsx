'use client'
import React from 'react'
import YoutubeComWrapper from '@/components/YoutubeComWrapper'
import useAppStore from '@/store/UserStore'
import HomePageUserSection from '@/components/HomePageUserSection'

const AdminPageComponent = () => {
  const user = useAppStore((s) => s.user)

  if (!user) {
    return null
  }
  if (!user.isAdmin) {
    return <HomePageUserSection />
  }
  return (
    <div className="p-2 m-2 h-full min-h-[50vh]">
      <YoutubeComWrapper />
    </div>
  )
}

export default AdminPageComponent
