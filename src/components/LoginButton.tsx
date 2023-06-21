'use client'

import React, { useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import useAppStore from '@/store/UserStore'
import { useCustomFetch } from './customFetchButton'
import { Dialog, Transition } from '@headlessui/react'

// Checking scope at backend
const scope_arr = [
  'https://www.googleapis.com/auth/youtube.readonly',
  // 'https://www.googleapis.com/auth/yt-analytics.readonly',
  // 'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
]

const LoginModal = () => {
  const { data, isLoading, error, __trigger, __reset } = useCustomFetch()
  const { user, setUser, setIsAdmin } = useAppStore()

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
        setUser(response.email)
        setIsAdmin(response?.isAdmin === true)
        localStorage.setItem('user_email', response.email)
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
      if (response?.success === true) {
        setUser(response.email)
        setIsAdmin(response?.isAdmin === true)
      } else {
        localStorage.removeItem('user_email')
      }
    })()
  }, [])

  return (
    <>
      <Transition show={!!error} as={React.Fragment}>
        <Dialog
          open={!!error}
          onClose={() => __reset()}
          as="div"
          className="relative z-10"
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Something Went Wrong
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {JSON.stringify(error?.message || error)}
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={() => __reset()}
                    >
                      Okay
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <div className="flex items-center">
        <div className="m-4 flex items-center gap-[10px] min-w-[50%]">
          <button
            className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded relative"
            onClick={() => {
              if (isLoading) return
              login()
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
        </div>
      </div>
    </>
  )
}

export default LoginModal
