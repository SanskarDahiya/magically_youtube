import { type NextRequest } from 'next/server'
import { _getTime, _updateTime, getClientDb } from '@/components/getMongoDb'
import oauth2Client from '@/components/getGoogleAuth'
import { google } from 'googleapis'
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
    console.log(
      '🚀 ~ file: route.tsx:17 ~ POST ~ existingUserResult:',
      existingUserResult
    )
    if (!existingUserResult) {
      throw new Error('Invalid User')
    }
    const accessToken = (existingUserResult.tokens.token_type +
      ' ' +
      existingUserResult.tokens.access_token) as string
    const refreshToken = existingUserResult.tokens.refresh_token

    oauth2Client.credentials = existingUserResult.tokens
    var service = google.youtube('v3')
    const response = await service.channels.list({
      auth: oauth2Client,
      part: ['id'],
      mine: true,
      // forUsername: 'GoogleDevelopers',
    })

    console.log('🚀 ~ file: route.tsx:29 ~ POST ~ response:', response)
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

// curl --request GET \
//   // --url 'https://www.googleapis.com/youtube/v3/channels?part=id&mine=true' \
//   // --header 'Accept: application/json' \
//   // --header 'Authorization: Bearer ya29.a0AWY7Ckm_W3W1xPDALVTDjOGTnYUge_71JalzUGKfh-U1HviJLJwDnL2_cdUp7THx49BFTBy0h0tbON6XTgFWfL-5AmFznNaaOQ6h2ztigbcEx0q_C61aRJsXNyUGx_32LcK59b-SElVdChqXO8sQPRfuRTpYaCgYKAZsSARESFQG1tDrpTc13JmDJmIArVnZs_kcpnQ0163'
