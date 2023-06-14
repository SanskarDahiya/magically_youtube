import { type NextRequest } from 'next/server'
import { getClientDb } from '@/components/getMongoDb'

export async function POST(request: NextRequest) {
  try {
    const res = await request.json()

    if (!res?.email) {
      throw new Error('Invalid Request')
    }
    const db = await getClientDb()
    const existingUserResult = await db.collection('user_tokens').findOne({
      email: res?.email,
      isDeleted: false,
    })
    if (!existingUserResult) {
      throw new Error('Invalid User')
    }
    return new Response(
      JSON.stringify({
        success: true,
        isAdmin: existingUserResult?.isAdmin || undefined,
      })
    )
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
