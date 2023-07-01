import type { NextRequest } from 'next/server'
import oauth2Client from '@/components/getGoogleAuth'
import { google } from 'googleapis'
import { checkGoogleAccessToken } from '@/helper/youtube_helper'
import { UserDao } from '@/serverComponent/DBWrapper'
import { logError, logInfo } from '@/helper/axiomLogger'

// https://developers.google.com/youtube/analytics/metrics
export async function POST(request: NextRequest) {
  try {
    const res = await request.json()
    if (!res?.email || !res?.yt_query) {
      throw new Error('Invalid Request')
    }
    const searchUser = res.searchUser || res.email

    const existingUserResult = await UserDao.getByEmail(searchUser)
    logInfo(
      '🚀 ~ file: route.tsx:17 ~ POST ~ existingUserResult:' +
        JSON.stringify(existingUserResult)
    )
    if (!existingUserResult) {
      throw new Error('Invalid User Id Searched')
    }

    const currentUserResult = await UserDao.getActiveUserByEmail(res?.email)
    logInfo(
      '🚀 ~ file: route.tsx:17 ~ POST ~ currentUserResult:' +
        JSON.stringify(currentUserResult)
    )
    if (!currentUserResult || currentUserResult.isAdmin !== true) {
      throw new Error('Invalid Request')
    }
    if (!existingUserResult?.tokens) {
      throw new Error('No Youtube Token present')
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

    // startDate: '2022-05-12',
    // endDate: '2023-06-15',
    // // metrics:
    // //   'views,comments,likes,dislikes,estimatedMinutesWatched,averageViewDuration',
    // // // access_token:
    // // // // ids: 'channel==UC40mthd7vTS-rR0HqKjfVXA', // Replace with your channel ID
    // // startDate: '2023-06-14',
    // // endDate: '2023-06-20',

    // metrics: [
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
    // ].join(','),
    // // // 'views,likes,comments,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained',
    // // // dimensions: 'video',
    // // // // sort: 'day',
    // // dimensions: 'day', //
    // // //       ageGroup
    // // // channel
    // // // country
    // // // day
    // // // gender
    // // // month
    // // // sharingService
    // // // uploaderType
    // // // video
    // // // filters: `video==0QoW8ywX1Pk`,
    // // // filters: `video==sKiUO8EFiXs`,o19A0QnH8NY
    // filters: `video==HrcPm-AOjQ8`, //o19A0QnH8NY
    // // // ids: 'channel==UC40mthd7vTS-rR0HqKjfVXA',//UC2LojO_Rcwlf9rcJIuK-qNw
    // // // ids: 'channel==UC2LojO_Rcwlf9rcJIuK-qNw', //channel==MINE
    // // ids: 'channel==MINE', //
    // // // metrics:
    // // //   'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained',
    // // // dimensions: 'day',
    // // sort: 'day',
    // // // sort: 'video',
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

    logInfo(
      '🚀 ~ file: youtube_analytic.tsx:59 ~ POST ~ response:' +
        JSON.stringify(response)
    )

    return new Response(JSON.stringify(response.data))
  } catch (err: any) {
    logError('🚀 ~ file: route.tsx:32 ~ POST ~ err:', err)
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
