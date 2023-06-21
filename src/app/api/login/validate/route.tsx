import { type NextRequest } from 'next/server'
import { getUserTable } from '@/components/getMongoDb'
import { checkGoogleAccessToken } from '@/helper/youtube_helper'
import { IUser_DB } from '@/dbTypes'
import { populateUserResponse } from '@/helper/populateResponse'

export async function POST(request: NextRequest) {
  try {
    const res = await request.json()

    if (!res?.email) {
      throw new Error('Invalid Request')
    }
    const userDb = await getUserTable()
    const existingUserResult = (await userDb.findOne({
      email: res?.email,
    })) as IUser_DB

    if (!existingUserResult) {
      throw new Error('Invalid User')
    }

    if (existingUserResult.isDeleted) {
      throw new Error(`Session Expired! Please Login Again`)
    }

    return new Response(populateUserResponse(existingUserResult))
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
