import type { NextRequest } from 'next/server'
import { CampaignEventDao, UserDao } from '@/serverComponent/DBWrapper'
import { ICampaignMapping, ICampaignMappingLiveStats, IUser } from '@/dbTypes'
import { ObjectId } from 'mongodb'
import wretch from 'wretch'
import { logError, logInfo } from '@/helper/axiomLogger'

const loco_token = process.env.LOCO_TOKEN as string
const IVORY_URL = process.env.IVORY_URL as string
const CHAT_URL = process.env.CHAT_URL as string

const fetchLocoLiveStats = async (user: IUser) => {
  let stats: ICampaignMappingLiveStats | null = null
  let videoId: string | null = null
  let channelId: string | null = user?.locoChannel?.id || null || '9R12JB1MZE'
  try {
    if (!channelId) {
      throw new Error(
        '--->>> No Loco Channel Found <<=====' + user._id + '::' + user.email
      )
    }

    const listVideosApiResponse = await wretch(
      `${IVORY_URL}/profile/${channelId}/streams/?limit=1`
    )
      .auth(loco_token)
      .get()
      .json((item) => {
        if (
          Array.isArray(item?.results) &&
          item.results[0] &&
          item.results[0].status === 20
        ) {
          return item.results[0]
        }
        return null
      })
      .catch((err: any) => {
        console.error('Fetch Stream List Failed:', err)
        logError('Fetch Stream List Failed:' + channelId, err?.message)
        return Promise.reject(err)
      })

    logInfo('>> API RESPONSE::' + JSON.stringify({ listVideosApiResponse }))
    videoId = listVideosApiResponse?.uid || null
    if (!videoId) {
      throw new Error(
        '--->>> User is not LIVE:LOCO_CALL <<=====' +
          user._id +
          '::' +
          user.email +
          '::' +
          channelId
      )
    }

    const chatApiResponse = await wretch(`${CHAT_URL}/streams/${videoId}/chat/`)
      .auth(loco_token)
      .get()
      .json((item) => item)
      .catch((err: any) => {
        console.error('Fetch Stream Chat Failed:', err)
        logError(
          'Fetch Stream Chat Failed:' + videoId + ':' + channelId,
          err?.message
        )
        return Promise.reject(err)
      })
    logInfo('>> API RESPONSE::' + JSON.stringify({ chatApiResponse }))

    stats = {
      liveStreamingDetails: {
        // activeLiveChatId:" string | null",,
        // actualEndTime:" string | null",
        actualStartTime:
          listVideosApiResponse?.started_at || listVideosApiResponse?.created_at
            ? new Date(
                listVideosApiResponse?.started_at ||
                  listVideosApiResponse?.created_at
              ).toISOString()
            : null,
        concurrentViewers:
          '' +
          (chatApiResponse?.acu ||
            listVideosApiResponse?.currrentViews ||
            listVideosApiResponse?.viewersCurrent ||
            0),
        // scheduledEndTime:" string | null",
        // scheduledStartTime:" string | null",
      },
      streamInfo: {
        categoryId: Array.isArray(listVideosApiResponse?.categories)
          ? (listVideosApiResponse?.categories)
              .map((item: any) => item?.category)
              .join(',')
          : '',
        channelId: channelId,
        channelTitle: listVideosApiResponse?.streamer?.bio,
        // defaultAudioLanguage: ' string | null',
        // defaultLanguage: ' string | null',
        description: listVideosApiResponse?.description || '',
        // liveBroadcastContent: ' string | null',
        // localized: { description: string | null; title: string | null }
        publishedAt: new Date(listVideosApiResponse.created_at).toISOString(),
        tags: listVideosApiResponse?.tags || [],
        thumbnails: listVideosApiResponse?.thumbnail_url_small
          ? {
              height: 480,
              url: listVideosApiResponse.thumbnail_url_small,
              width: 640,
            }
          : undefined,
        title: listVideosApiResponse?.title,
      },
      statistics: {
        concurrentViewers:
          chatApiResponse?.acu ||
          listVideosApiResponse?.currrentViews ||
          listVideosApiResponse?.viewersCurrent ||
          0,
        commentCount: 0,
        dislikeCount: 0,
        favoriteCount: 0,
        likeCount: listVideosApiResponse?.likes || 0,
        viewCount:
          (listVideosApiResponse?.total_live_views_count || 0) +
          (listVideosApiResponse?.total_vod_views_count || 0),
      },
    }
  } catch (err: any) {
    console.error('🚀 ~ file: route.tsx:13 ~ fetchLocoLiveStats ~ err:', err)
    logError(
      '🚀 ~ file: route.tsx:13 ~ fetchLocoLiveStats ~ err:',
      err?.message
    )
  }
  return {
    isLive: !!videoId,
    stats,
    channelId,
    videoId,
  }
}

export async function POST(request: NextRequest) {
  try {
    const responseBody = await request.json()
    const {
      username: streamerUsername,
      timestamp: WebTimeStamp,
      isActive,
    } = responseBody || {}
    if (!streamerUsername) {
      throw new Error('Invalid Request')
    }
    // NaN is False
    const timestamp = new Date(WebTimeStamp).getTime() || new Date().getTime()

    const user = await UserDao.getByUsername(streamerUsername)
    if (!user) {
      throw new Error('Invalid Streamer')
    }

    const CampaignId =
      user.currentCampaignId || new ObjectId('6491795bdf1faef3505e512b') // loco-web-testing

    // Later will be fetched from user collection
    const { isLive, stats, channelId, videoId } = await fetchLocoLiveStats(user)
    const DataToInsert: ICampaignMapping = {
      _id: new ObjectId(),
      _createdOn: new Date(),
      _updatedOn: new Date(),
      userId: user._id,
      userEmail: user.email,
      campaignId: CampaignId,
      isActive: isActive,
      eventFiredOn: new Date(timestamp),
      eventType: 'LOCO',
      isLiveVideoPresent: !!isLive,
      channelId,
      videoId,
      loco_stats: stats,
    }

    await CampaignEventDao.insert(DataToInsert)
    return new Response(JSON.stringify({ success: true }))
  } catch (err: any) {
    logError('🚀 ~ file: route.tsx:53 ~ POST ~ err:', err)
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
