import { type NextRequest } from 'next/server'
import { _getTime, _updateTime, getClientDb } from '@/components/getMongoDb'
import oauth2Client from '@/components/getGoogleAuth'
import { google } from 'googleapis'
import { googleServiceList } from '@/components/youtubeInterface'
import { checkGoogleAccessToken } from '@/helper/refreshGoogleAccount'

export async function POST(request: NextRequest) {
  try {
    const res = await request.json()
    let yt_service =
      (googleServiceList.includes(res?.yt_service) && res.yt_service) ||
      'channel'
    if (!res?.email || !res?.yt_query) {
      throw new Error('Invalid Request')
    }
    const searchUser = res.searchUser || res.email
    const db = await getClientDb()
    const existingUserResult = await db.collection('user_tokens').findOne({
      email: searchUser,
    })
    console.log(
      '🚀 ~ file: route.tsx:17 ~ POST ~ existingUserResult:',
      JSON.stringify(existingUserResult)
    )
    if (!existingUserResult) {
      throw new Error('Invalid User Id Searched')
    }

    const currentUserResult = await db.collection('user_tokens').findOne({
      email: res?.email,
      isDeleted: false,
      isAdmin: true,
    })
    console.log(
      '🚀 ~ file: route.tsx:17 ~ POST ~ currentUserResult:',
      JSON.stringify(currentUserResult)
    )
    if (!currentUserResult) {
      throw new Error('Invalid Request')
    }
    const newTokens = await checkGoogleAccessToken(
      existingUserResult._id,
      existingUserResult.tokens
    )

    oauth2Client.setCredentials(newTokens || existingUserResult.tokens)
    var service = google.youtube('v3')

    // @ts-ignore
    if (!service[yt_service]) {
      yt_service = 'channel'
    }

    // @ts-ignore
    const response = await service[yt_service].list({
      ...res?.yt_query,
      auth: oauth2Client,
    })

    console.log(
      '🚀 ~ file: route.tsx:29 ~ POST ~ response:',
      JSON.stringify({ yt_query: res?.yt_query, resp: response.data })
    )
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
