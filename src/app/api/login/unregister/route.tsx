import { type NextRequest } from 'next/server'
import { _getTime, _updateTime, getClientDb } from '@/components/getMongoDb'

export async function POST(request: NextRequest) {
  try {
    const res = await request.json()
    if (!res?.email) {
      throw new Error('Invalid Request')
    }
    const db = await getClientDb()
    const response = await db
      .collection('user_tokens')
      .find({ email: res?.email, isDeleted: false })
      .toArray()
    for (let item of response) {
      await db
        .collection('user_tokens')
        .findOneAndUpdate(
          { _id: item._id },
          { $set: _updateTime({ isDeleted: true }) }
        )
    }
    return new Response(
      JSON.stringify({
        success: true,
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
