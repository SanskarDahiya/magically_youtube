'use client'
import React, { useEffect, useState } from 'react'
import YoutubeComWrapper from '@/components/YoutubeComWrapper'
import useUserStore from '@/store/UserStore'
import { useCustomFetch } from '@/components/customFetchButton'
import LoginModal from '@/components/LoginButton'

const YTCall = () => {
  const user = useUserStore((s) => s.user)
  const [isShowAdmin, setShowAdmin] = useState(false)
  const { __trigger } = useCustomFetch()
  useEffect(() => {
    setShowAdmin(false)
    const user_ = localStorage.getItem('user_email')
    if (user_ !== user) {
      user_ && useUserStore.getState().setUser(user_)
      return
    }
    if (user) {
      ;(async () => {
        const response = await __trigger('/api/login/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user }),
        })
        if (response?.success === true && response?.isAdmin) {
          setShowAdmin(true)
        }
      })()
    }
  }, [user])

  if (!isShowAdmin) {
    return (
      <div className="z-[-1] fixed h-screen w-screen inset-0">
        <div
          style={{
            fontFamily:
              'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
            height: '100vh',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ lineHeight: 48 }}>
            <style
              dangerouslySetInnerHTML={{
                __html:
                  'body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}',
              }}
            />
            <h1
              className="next-error-h1"
              style={{
                display: 'inline-block',
                margin: '0 20px 0 0',
                paddingRight: 23,
                fontSize: 24,
                fontWeight: 500,
                verticalAlign: 'top',
              }}
            >
              404
            </h1>
            <div style={{ display: 'inline-block' }}>
              <h2 style={{ fontSize: 14, fontWeight: 400, lineHeight: 28 }}>
                This page could not be found
              </h2>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div
      className="p-2 m-2 h-full min-h-[50vh] border border-black border-solid"
      style={{
        cursor: user ? 'auto' : 'not-allowed',
        opacity: user ? 1 : 0.5,
      }}
    >
      <LoginModal isAdmin={isShowAdmin} />
      <YoutubeComWrapper />
    </div>
  )
}

export default YTCall
