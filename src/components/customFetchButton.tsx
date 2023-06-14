'use client'
import { useState } from 'react'

export const fetchInfo = () => {
  const [data, setData] = useState<any>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>()

  return {
    data,
    isLoading,
    error,
    __reset: () => {
      setError(undefined)
      setData(undefined)
    },
    __trigger: async (url: string, options: any) => {
      setIsLoading(true)
      setError(undefined)
      setData(undefined)
      let response_to_return
      try {
        const result = await fetch(url, options).then(async (res) => {
          if (res.ok && res.status === 200) {
            return res.json()
          } else {
            setError(await res.json())
          }
        })

        setData(result)
        response_to_return = result
      } catch (err: any) {
        response_to_return = err
        setError({ code: err.code, message: err.message, stack: err.stack })
      } finally {
        setIsLoading(false)
      }
      console.log('🚀 ~ file: ~ result:', response_to_return)
      return response_to_return
    },
  }
}
