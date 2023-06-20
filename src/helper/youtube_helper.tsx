import { ObjectId } from 'mongodb'
import { Auth, youtube_v3 } from 'googleapis'
import oauth2Client from '@/components/getGoogleAuth'
import { _updateTime, getClientDb, getUserTable } from '@/components/getMongoDb'
import youtubeDataV3 from './youtubeDataV3'

export const fetchYTLiveStats = async (user: any) => {
  let channelIds = []
  let videoIds = []
  let stats = null
  try {
    const getChannelList = await youtubeDataV3(user, {
      yt_query: {
        part: ['id'],
        mine: true,
      },
      yt_service: 'channels',
    })
    channelIds = (
      (Array.isArray(getChannelList?.data?.items) &&
        getChannelList?.data?.items) ||
      []
    ).map((channelItem: any) => {
      return channelItem?.id
    })
    const channelId = channelIds[0]

    const searchLiveVideoResponse = await youtubeDataV3(user, {
      yt_query: {
        channelId: channelId,
        part: ['snippet'],
        eventType: 'live',
        type: 'video',
      },
      yt_service: 'search',
    })

    videoIds = (
      (Array.isArray(searchLiveVideoResponse?.data?.items) &&
        searchLiveVideoResponse?.data?.items) ||
      []
    ).map((videoItem: any) => {
      return videoItem?.id?.videoId
    })
    const videoId = videoIds[0]

    if (videoId) {
      const liveVideoStats = (await youtubeDataV3(user, {
        yt_query: {
          id: videoId,
          part: [
            'id',
            'fileDetails',
            'liveStreamingDetails',
            'statistics',
            'snippet',
            'status',
          ],
        },
        yt_service: 'videos',
      })) as { data: youtube_v3.Schema$VideoListResponse }

      const videoItems =
        (Array.isArray(liveVideoStats?.data?.items) &&
          liveVideoStats?.data?.items) ||
        []

      const videoItem = videoItems[0]

      const concurrentViewers =
        videoItem.liveStreamingDetails?.concurrentViewers
      const commentCount = videoItem.statistics?.commentCount
      const dislikeCount = videoItem.statistics?.dislikeCount
      const favoriteCount = videoItem.statistics?.favoriteCount
      const likeCount = videoItem.statistics?.likeCount
      const viewCount = videoItem.statistics?.viewCount
      stats = {
        status: videoItem.status,
        streamInfo: videoItem.snippet,
        fileDetails: videoItem.fileDetails,
        statistics: {
          concurrentViewers: parseInt(concurrentViewers || '') || 0,
          commentCount: parseInt(commentCount || '') || 0,
          dislikeCount: parseInt(dislikeCount || '') || 0,
          favoriteCount: parseInt(favoriteCount || '') || 0,
          likeCount: parseInt(likeCount || '') || 0,
          viewCount: parseInt(viewCount || '') || 0,
        },
      }
    }
  } catch (err: any) {
    console.log(
      '🚀 ~ file: youtube_helper.tsx:92 ~ fetchYTLiveStats ~ err:',
      err?.code
    )
    console.log(
      '🚀 ~ file: youtube_helper.tsx:92 ~ fetchYTLiveStats ~ err:',
      err?.message
    )
  }
  return {
    isLive: videoIds.length > 0,
    stats,
    channelIds,
    videoIds,
  }
}

export const checkGoogleAccessToken = async (
  _id: ObjectId,
  tokens: Auth.Credentials
): Promise<Auth.Credentials> => {
  oauth2Client.setCredentials(tokens)
  try {
    if (
      tokens.expiry_date &&
      new Date(tokens.expiry_date).getTime() - new Date().getTime() < 0
    ) {
      // token is expired..
      const { credentials } = await oauth2Client.refreshAccessToken()
      tokens = credentials
      const userDb = await getUserTable()
      await userDb.findOneAndUpdate(
        { _id: _id },
        {
          $set: _updateTime({
            tokens: credentials,
            token_refreshed_on: new Date(),
          }),
          $inc: { token_refresh_count: 1 },
        }
      )

      return credentials
    }
  } catch (err: unknown) {
    // @ts-ignore
    const errMEssage = err?.message || 'Invalid Token Grant'
    if (errMEssage === 'invalid_grant') {
      // @ts-ignore
      throw new Error('Token has been revoked.')
    }
    throw new Error(errMEssage)
  }
  return tokens
}
