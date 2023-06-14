import { type NextRequest } from 'next/server'
import { _getTime, _updateTime, getClientDb } from '@/components/getMongoDb'
import oauth2Client from '@/components/getGoogleAuth'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const res = await request.json()

    if (!res?.code) {
      throw new Error('Invalid Code')
    }
    const db = await getClientDb()
    const { tokens: data } = await oauth2Client.getToken(res?.code)
    let email
    if (!data.access_token || !data.refresh_token) {
      throw new Error('Invalid Tokens Found from googleApis')
    }

    if (data.access_token) {
      const UserInfo = await oauth2Client.getTokenInfo(data.access_token)
      email = UserInfo.email
    }
    if (data.scope?.search('youtube.readonly') === -1) {
      throw new Error('Youtube access is not provided')
      return
    }

    const objIdCon = new ObjectId()

    const existingUserResult = await db.collection('user_tokens').findOne({
      email: email,
      isDeleted: false,
    })
    console.log(
      '🚀 ~ file: route.tsx:37 ~ POST ~ result:',
      JSON.stringify(existingUserResult)
    )

    if (existingUserResult) {
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
    }
    const isAdminUser = await db.collection('user_tokens').findOne({
      email: email,
      isAdmin: true,
    })

    await db.collection('user_tokens').insertOne(
      _getTime({
        _id: objIdCon,
        email: email,
        code: res?.code,
        tokens: data,
        isDeleted: false,
        raw_response: JSON.stringify(res),
        isAdmin: !!isAdminUser?.isAdmin || undefined,
      })
    )
    return new Response(
      JSON.stringify({
        success: true,
        user: email,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'set-cookie': `user:${email};`,
        },
      }
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
