import { type NextRequest } from 'next/server'
import { UserDao } from '@/serverComponent/DBWrapper'

export async function POST(request: NextRequest) {
  try {
    const res = await request.json()

    if (!res?.email) {
      throw new Error('Invalid Request')
    }
    const existingUserResult = await UserDao.getByEmail(res.email)
    if (!existingUserResult) {
      throw new Error('Invalid User')
    }

    if (existingUserResult.isDeleted) {
      throw new Error(`Session Expired! Please Login Again`)
    }

    return new Response(UserDao.populateSuccess(existingUserResult))
  } catch (err: any) {
    console.log('🚀 ~ file: route.tsx:22 ~ POST ~ err:', err)
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
