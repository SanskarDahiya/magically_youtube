import type { NextRequest } from 'next/server'
import youtubeDataV3 from '@/helper/youtubeDataV3'
import { UserDao } from '@/serverComponent/DBWrapper'

export async function POST(request: NextRequest) {
  try {
    const res = await request.json()
    if (!res?.email || !res?.yt_query) {
      throw new Error('Invalid Request')
    }
    const searchUser = res.searchUser || res.email
    const existingUserResult = await UserDao.getByEmail(searchUser)
    console.log(
      '🚀 ~ file: route.tsx:17 ~ POST ~ existingUserResult:',
      JSON.stringify(existingUserResult)
    )
    if (!existingUserResult) {
      throw new Error('Invalid User Id Searched')
    }

    const currentUserResult = await UserDao.getActiveUserByEmail(res?.email)
    console.log(
      '🚀 ~ file: route.tsx:17 ~ POST ~ currentUserResult:',
      JSON.stringify(currentUserResult)
    )
    if (!currentUserResult || currentUserResult.isAdmin !== true) {
      throw new Error('Invalid Request')
    }

    // @ts-ignore
    const response = await youtubeDataV3(existingUserResult, {
      yt_query: res?.yt_query,
      yt_service: res?.yt_service,
    })

    return new Response(JSON.stringify(response.data))
  } catch (err: any) {
    console.log('🚀 ~ file: route.tsx:32 ~ POST ~ err:', err)
    return new Response(
      JSON.stringify({
        code: err.code,
        message: err.message,
        stack: err.stack,
      }),
      {
        status: 518,
      }
    )
  }
}
