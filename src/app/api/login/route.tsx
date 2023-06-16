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
      throw new Error('Invalid Request. Please Try Again later.')
    }

    if (data.access_token) {
      const UserInfo = await oauth2Client.getTokenInfo(data.access_token)
      email = UserInfo.email
    }

    // if (data.scope?.search('youtube.readonly') === -1) {
    //   throw new Error('Youtube access is not provided')
    //   return
    // }
    // if (data.scope?.search('yt-analytics.readonly') === -1) {
    //   throw new Error('Youtube access is not provided')
    //   return
    // }
    // if (data.scope?.search('yt-analytics-monetary.readonly') === -1) {
    //   throw new Error('Youtube access is not provided')
    //   return
    // }

    const objIdCon = new ObjectId()

    const existingUserResult =
      (await db
        .collection('user_tokens')
        .find({ email: email })
        .sort({ _updatedOn: -1 })
        .toArray()) || []

    console.log(
      '🚀 ~ file: route.tsx:37 ~ POST ~ result:',
      JSON.stringify(existingUserResult[0])
    )

    if (existingUserResult.length > 0) {
      const response = existingUserResult.map((item) => {
        return {
          ...item,
          isDeleted: true,
          _id: new ObjectId(),
          _deletedOn: new Date(),
        }
      })
      // Transfer All data into another table
      await db.collection('deleted_user_tokens').insertMany(response)
      await db.collection('user_tokens').deleteMany({ email: email })
    }

    await db.collection('user_tokens').insertOne(
      _getTime({
        ...existingUserResult[0],
        _id: objIdCon,
        email: email,
        code: res?.code,
        tokens: data,
        isDeleted: false,
        raw_response: JSON.stringify(res),
        isAdmin: !!existingUserResult[0]?.isAdmin,
      })
    )
    return new Response(
      JSON.stringify({
        success: true,
        user: email,
        isAdmin: !!existingUserResult[0]?.isAdmin || undefined, // undefined removed entry from response
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
