'use client'
import React from 'react'
import YoutubeComWrapper from '@/components/YoutubeComWrapper'
import useUserStore from '@/store/UserStore'

const YTCall = () => {
  const user = useUserStore((s) => s.user)
  return (
    <div
      className="p-2 m-2 h-full min-h-[50vh] border border-black border-solid"
      style={{
        cursor: user ? 'auto' : 'not-allowed',
        opacity: user ? 1 : 0.5,
      }}
    >
      <YoutubeComWrapper />
    </div>
  )
}

export default YTCall
