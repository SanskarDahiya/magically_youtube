import { UserDao } from '@/serverComponent/DBWrapper'
import { type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const res = await request.json()
    if (!res?.email) {
      throw new Error('Invalid Request')
    }

    const response = await UserDao.getActiveUserByEmail(res?.email)
    if (response) {
      await UserDao.markUserInActive([response._id])
    }

    return new Response(JSON.stringify({ success: true }))
  } catch (err: any) {
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
