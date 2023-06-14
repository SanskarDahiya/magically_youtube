import { type NextRequest } from 'next/server'
import { _getTime, _updateTime, getClientDb } from '@/components/getMongoDb'
import oauth2Client from '@/components/getGoogleAuth'
import { google } from 'googleapis'
import { googleServiceList } from '@/components/youtubeInterface'

export async function POST(request: NextRequest) {
  try {
    const res = await request.json()
    let yt_service =
      (googleServiceList.includes(res?.yt_service) && res.yt_service) ||
      'channel'
    if (!res?.email || !res?.yt_query) {
      throw new Error('Invalid Request')
    }
    const db = await getClientDb()
    const existingUserResult = await db.collection('user_tokens').findOne({
      email: res?.email,
      isDeleted: false,
    })
    console.log(
      '🚀 ~ file: route.tsx:17 ~ POST ~ existingUserResult:',
      existingUserResult
    )
    if (!existingUserResult) {
      throw new Error('Invalid User')
    }
    // const accessToken = (existingUserResult.tokens.token_type +
    //   ' ' +
    //   existingUserResult.tokens.access_token) as string
    // const refreshToken = existingUserResult.tokens.refresh_token

    oauth2Client.credentials = existingUserResult.tokens
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
