import { type NextRequest } from 'next/server'
import { getUserTable } from '@/components/getMongoDb'
import { checkGoogleAccessToken } from '@/helper/youtube_helper'

export async function POST(request: NextRequest) {
  try {
    const res = await request.json()

    if (!res?.email) {
      throw new Error('Invalid Request')
    }
    const userDb = await getUserTable()
    const existingUserResult = await userDb.findOne({
      email: res?.email,
      isDeleted: false,
    })
    if (!existingUserResult) {
      throw new Error('Invalid User')
    }
    // No need to validate here
    // IMP: Can do here as well
    // await checkGoogleAccessToken(
    //   existingUserResult._id,
    //   existingUserResult.tokens
    // )
    return new Response(
      JSON.stringify({
        success: true,
        isAdmin: !!existingUserResult?.isAdmin || undefined, // undefined removed entry from response
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
