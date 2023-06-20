/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'
import LogoImg from '@public/logo-white.png'

const TIME_TILL_SHOW = 15000 //show=true
const TIME_TILL_HIDE = 45000 //show=false

export default function Home({ params }: { params: { username: string } }) {
  const isObsSourceActive = useRef(true)
  const isStreaming = useRef(false)
  const [showLogo, setShowLogo] = useState(false)

  const username = params.username

  useEffect(() => {
    if (!username) return

    const isObsPresent = !!window?.obsstudio?.pluginVersion

    const intervalId = isObsPresent
      ? setInterval(() => {
          sendData(username)
        }, 60000)
      : null

    isObsSourceActive.current = isObsPresent
    window?.obsstudio?.getStatus((status: OBSStatus) => {
      isStreaming.current = status.streaming
    })

    function onObsSourceActiveChanged(event: CustomEvent<ActiveInfo>) {
      isObsSourceActive.current = !!event.detail.active
    }
    function obsStreamingStarted() {
      isStreaming.current = true
    }
    function obsStreamingStopped() {
      isStreaming.current = false
    }
    window.addEventListener('obsSourceActiveChanged', onObsSourceActiveChanged)
    window.addEventListener('obsStreamingStarted', obsStreamingStarted)
    window.addEventListener('obsStreamingStopped', obsStreamingStopped)

    return () => {
      window.removeEventListener(
        'obsSourceActiveChanged',
        onObsSourceActiveChanged
      )
      window.removeEventListener('obsStreamingStarted', obsStreamingStarted)
      window.removeEventListener('obsStreamingStopped', obsStreamingStopped)
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [])

  useEffect(() => {
    let timerId: NodeJS.Timer
    if (showLogo) {
      timerId = setTimeout(() => {
        setShowLogo(false)
      }, TIME_TILL_SHOW)
    } else {
      timerId = setTimeout(() => {
        setShowLogo(true)
      }, TIME_TILL_HIDE)
    }

    return () => {
      clearTimeout(timerId)
    }
  }, [showLogo])

  const sendData = async (username: string) => {
    if (!isStreaming.current) return

    const currentTimestamp = new Date()
    var timestampValue = currentTimestamp
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ')

    await fetch('/api/v1/campaign/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: timestampValue,
        isActive: isObsSourceActive.current,
        username,
      }),
    })
  }

  return (
    <div className="h-screen w-screen bg-transparent text-2xl flex justify-start items-center p-4 text-black">
      <img
        src={LogoImg.src}
        alt="logo"
        height={200}
        width={200}
        className={`${
          showLogo ? 'opacity-100' : 'opacity-0'
        } transition-opacity ease-in-out duration-1000 bg-black`}
      />
    </div>
  )
}
