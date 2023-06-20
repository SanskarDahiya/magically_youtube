import { ObjectId } from 'mongodb'
import { Auth } from 'googleapis'
import oauth2Client from '@/components/getGoogleAuth'
import { _updateTime, getClientDb } from '@/components/getMongoDb'
import youtubeDataV3 from './youtubeDataV3'

export const fetchYTLiveStats = async (user: any) => {
  const getChannelList = await youtubeDataV3(user, {
    yt_query: {
      part: ['id'],
      mine: true,
    },
    yt_service: 'channels',
  })
  const channelIds = (
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

  const videoIds = (
    (Array.isArray(searchLiveVideoResponse?.data?.items) &&
      searchLiveVideoResponse?.data?.items) ||
    []
  ).map((videoItem: any) => {
    return videoItem?.id?.videoId
  })
  const videoId = videoIds[0]
  let stats = null
  if (videoId) {
    const liveVideoStats = await youtubeDataV3(user, {
      yt_query: {
        id: videoId,
        part: ['id', 'liveStreamingDetails', 'statistics', 'snippet', 'status'],
      },
      yt_service: 'videos',
    })
    stats = liveVideoStats.data
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
      const db = await getClientDb()
      await db.collection('user_tokens').findOneAndUpdate(
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
