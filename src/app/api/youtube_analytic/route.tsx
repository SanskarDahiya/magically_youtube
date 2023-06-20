import { type NextRequest } from 'next/server'
import { _getTime, _updateTime, getClientDb } from '@/components/getMongoDb'
import oauth2Client from '@/components/getGoogleAuth'
import { google } from 'googleapis'
import { checkGoogleAccessToken } from '@/helper/youtube_helper'

// https://developers.google.com/youtube/analytics/metrics
export async function POST(request: NextRequest) {
  try {
    const res = await request.json()
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

    const youtubeAnalytics = google.youtubeAnalytics('v2')

    // const valid_metrics = [
    //   'averageViewDuration',
    //   'comments',
    //   'dislikes',
    //   'estimatedMinutesWatched',
    //   // 'estimatedRevenue',
    //   'likes',
    //   // 'shares',
    //   'subscribersGained',
    //   // 'subscribersLost',
    //   // 'viewerPercentage',
    //   'views',
    // ]
    // let metrics = []
    // const input_metrics = (res?.yt_query?.metrics || '').split(',')
    // for (let i = 0; i < input_metrics.length; i++) {
    //   if (valid_metrics.includes(input_metrics[i])) {
    //     metrics.push(input_metrics[i])
    //   }
    // }

    // if (metrics.length === 0) {
    //   metrics = metrics.concat(valid_metrics)
    // }
    const response = await youtubeAnalytics.reports.query({
      ids: 'channel==MINE',
      ...res?.yt_query,
      access_token:
        newTokens.access_token || existingUserResult.tokens.access_token || '',
      // metrics: metrics.join(','),
    })

    console.log(
      '🚀 ~ file: youtube_analytic.tsx:59 ~ POST ~ response:',
      JSON.stringify(response)
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
