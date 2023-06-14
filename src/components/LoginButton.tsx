'use client'

import React, { useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import useUserStore from '@/store/UserStore'
import { fetchInfo } from './customFetchButton'
// Checking scope at backend
const scope_arr = ['https://www.googleapis.com/auth/youtube.readonly']
const LoginModal = ({ isAdmin }: { isAdmin?: boolean }) => {
  const { data, isLoading, error, __trigger } = fetchInfo()
  const { user, setUser } = useUserStore()

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      const response = await __trigger('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(codeResponse),
      })
      if (response?.success === true) {
        setUser(response.user)
        localStorage.setItem('user_email', response.user)
      } else if (response.message === 'Youtube access is not provided') {
        alert('Youtube access is not provided')
      }
    },
    onError: () => {
      console.log('Login Failed')
    },
    scope: scope_arr.join(', '),
    flow: 'auth-code',
  })

  const logout = async () => {
    await __trigger('/api/login/unregister', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: user }),
    })
    localStorage.removeItem('user_email')
    setUser(null)
  }

  useEffect(() => {
    const user_ = localStorage.getItem('user_email')
    if (!user_) return
    ;(async () => {
      const response = await __trigger('/api/login/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user_ }),
      })
      console.log('🚀 ~ file: page.tsx:90 ~ ; ~ response:', response)
      if (response?.success === true) {
        setUser(user_)
      } else {
        localStorage.removeItem('user_email')
      }
    })()
  }, [])

  return (
    <div className="flex items-center">
      <div className="m-4 flex items-center gap-[10px] min-w-[50%]">
        <button
          className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded relative"
          onClick={() => {
            if (isLoading) return
            if (user) {
              logout()
            } else {
              login()
            }
          }}
        >
          <div
            style={{
              visibility: isLoading ? 'hidden' : 'visible',
            }}
          >
            {user ? 'Unlink ' + user : 'Link Youtube Account'}
          </div>
          {isLoading && (
            <div
              role="status"
              className="absolute top-0 left-0 bottom-0 right-0 mt-1"
            >
              <svg
                aria-hidden="true"
                className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-red-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          )}
        </button>
        {error && JSON.stringify(error?.message || error)}
      </div>
      {isAdmin && (
        <div className="mr-10 w-[50%]">
          <label
            htmlFor="search"
            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              type="email"
              id="search"
              className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter Email Address"
            />
            <button
              type="submit"
              className="text-white absolute right-2.5 bottom-1.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => {
                alert('Nothing Happened! :P')
              }}
            >
              Search
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginModal
