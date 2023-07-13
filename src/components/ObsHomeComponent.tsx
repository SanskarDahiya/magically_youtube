/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'
import LogoImg from '@public/logo-white.png'
import { logInfo } from '@/helper/axiomLogger'

const TIME_TILL_SHOW = 15000 //show=true
const TIME_TILL_HIDE = 45000 //show=false

function ObsHomeComponent({
  isStreamerHasCampaignId,
  params,
  API_URL,
}: {
  isStreamerHasCampaignId: boolean
  API_URL: string
  params: { username: string }
}) {
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

    logInfo(
      JSON.stringify({
        title: 'Will Page Initialize',
        username,
        intervalId: intervalId ? 'TIMER START' : 'OBS NOT FOUNR',
        pluginVersion: window?.obsstudio?.pluginVersion,
        isCampaignIdPresent: isStreamerHasCampaignId,
        isStreaming: isStreaming.current,
      })
    )

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
    const currentTimestamp = new Date()
    var timestampValue = currentTimestamp
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ')

    logInfo(
      JSON.stringify({
        title: 'Will make server update API CALL',
        IS_MAKING_API_CALL:
          !isStreaming.current || !isStreamerHasCampaignId ? 'YES' : 'NO',
        __params: {
          timestamp: timestampValue,
          isActive: isObsSourceActive.current,
          username,
        },
        isCampaignIdPresent: isStreamerHasCampaignId,
        isStreaming: isStreaming.current,
      })
    )

    if (!isStreaming.current || !isStreamerHasCampaignId) return
    await fetch(API_URL, {
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
      {!isStreamerHasCampaignId && !isStreaming.current ? (
        <>
          <div className="absolute top-[25%] left-0 bg-[rgba(0,0,0,0.2)] px-4 py-8 rounded text-[22px]">
            Thank you for participation.
            <br />
            You can remove this browser_source now.
          </div>
        </>
      ) : (
        <></>
      )}
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

export default ObsHomeComponent
