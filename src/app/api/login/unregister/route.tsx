import { type NextRequest } from 'next/server'
import { _getTime, _updateTime, getUserTable } from '@/components/getMongoDb'

export async function POST(request: NextRequest) {
  try {
    const res = await request.json()
    if (!res?.email) {
      throw new Error('Invalid Request')
    }
    const userDb = await getUserTable()
    const response = await userDb
      .find({ email: res?.email, isDeleted: false })
      .toArray()

    for (let item of response) {
      await userDb.findOneAndUpdate(
        { _id: item._id },
        { $set: _updateTime({ isDeleted: true }) }
      )
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
