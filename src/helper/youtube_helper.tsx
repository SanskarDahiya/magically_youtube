import oauth2Client from '@/components/getGoogleAuth'
import youtubeDataV3 from './youtubeDataV3'
import wretch from 'wretch'
import { parse } from 'node-html-parser'
import { UserDao } from '@/serverComponent/DBWrapper'
import type { ObjectId } from 'mongodb'
import type { Auth, youtube_v3 } from 'googleapis'
import type { ICampaignMappingLiveStats, IUser } from '@/dbTypes'

export const fetchChannelList = async (user: IUser) => {
  let channelIds: IUser['ytChannel'][] = []
  try {
    const getChannelList = (await youtubeDataV3(user, {
      yt_query: {
        part: ['id', 'snippet'],
        mine: true,
      },
      yt_service: 'channels',
    })) as { data: youtube_v3.Schema$ChannelListResponse }

    channelIds = (
      (Array.isArray(getChannelList?.data?.items) &&
        getChannelList?.data?.items) ||
      []
    ).map((channelItem) => {
      return {
        id: channelItem?.id,
        country: channelItem.snippet?.country,
        customUrl: channelItem.snippet?.customUrl,
        description: channelItem.snippet?.description,
        title: channelItem.snippet?.title,
      }
    })
  } catch (err) {}
  return channelIds
}

export const fetchYTLiveStats = async (user: IUser) => {
  let stats: ICampaignMappingLiveStats | null = null
  let videoId: string | null = null
  let channelId: string | null = user?.ytChannel?.id || null

  try {
    if (!user.ytChannel?.customUrl) {
      throw new Error(
        '--->>> No Youtube Channel Found <<=====' + user._id + '::' + user.email
      )
    }
    let response = new URL('http://localhost:8000') // just sample url
    try {
      response = await wretch(
        `https://youtube.com/${user.ytChannel?.customUrl}/live`
      )
        .get()
        .text((res) => parse(res))
        .then((res) => res.getElementsByTagName('link') || [])
        .then((res) =>
          res
            .filter((item) => item.getAttribute('rel') === 'canonical')
            .map((item) => item.getAttribute('href'))
        )
        .then((res) => new URL((Array.isArray(res) ? res[0] : res) || ''))
    } catch (err: any) {
      console.log(
        '🚀 ~ file: youtube_helper.tsx:82 ~ fetchYTLiveStats YT URL SCRAPPING ~ err:',
        err?.message
      )
    }
    videoId = response.searchParams.get('v') || null
    if (!videoId && response.href.search('youtube') >= 0) {
      throw new Error(
        '--->>> User is not LIVE:YTCALL <<=====' +
          user._id +
          '::' +
          user.email +
          '::' +
          user.ytChannel?.customUrl
      )
    }

    if (!videoId) {
      if (user?.ytChannel?.id) {
        console.warn(
          '===>>>====>>>> MAKING SEARCH API CALL NOW <<<<=====<<<<<===='
        )
        const searchLiveVideoResponse = (await youtubeDataV3(user, {
          yt_query: {
            channelId: user.ytChannel.id,
            part: ['snippet'],
            eventType: 'live',
            type: 'video',
          },
          yt_service: 'search',
        })) as { data: youtube_v3.Schema$SearchListResponse }

        const videoIds = (
          (Array.isArray(searchLiveVideoResponse?.data?.items) &&
            searchLiveVideoResponse?.data?.items) ||
          []
        ).map((videoItem: any) => {
          return videoItem?.id?.videoId
        })
        videoId = videoIds[0]
      }
      if (!videoId) {
        throw new Error(
          '--->>> User is not LIVE <<=====' +
            user._id +
            '::' +
            user.email +
            '::' +
            user.ytChannel?.customUrl
        )
      }
    }

    const liveVideoStats = (await youtubeDataV3(user, {
      yt_query: {
        id: videoId,
        part: ['id', 'liveStreamingDetails', 'statistics', 'snippet', 'status'],
      },
      yt_service: 'videos',
    })) as { data: youtube_v3.Schema$VideoListResponse }

    const videoItems =
      (Array.isArray(liveVideoStats?.data?.items) &&
        liveVideoStats?.data?.items) ||
      []

    const videoItem = videoItems[0]

    const concurrentViewers = videoItem.liveStreamingDetails?.concurrentViewers
    const commentCount = videoItem.statistics?.commentCount
    const dislikeCount = videoItem.statistics?.dislikeCount
    const favoriteCount = videoItem.statistics?.favoriteCount
    const likeCount = videoItem.statistics?.likeCount
    const viewCount = videoItem.statistics?.viewCount
    stats = {
      liveStreamingDetails: videoItem.liveStreamingDetails,
      status: videoItem.status,
      streamInfo: {
        ...videoItem.snippet,
        thumbnails: videoItem.snippet?.thumbnails?.standard,
      },
      statistics: {
        concurrentViewers: parseInt(concurrentViewers || '') || 0,
        commentCount: parseInt(commentCount || '') || 0,
        dislikeCount: parseInt(dislikeCount || '') || 0,
        favoriteCount: parseInt(favoriteCount || '') || 0,
        likeCount: parseInt(likeCount || '') || 0,
        viewCount: parseInt(viewCount || '') || 0,
      },
    }
  } catch (err: any) {
    console.log(
      '🚀 ~ file: youtube_helper.tsx:92 ~ fetchYTLiveStats ~ err:',
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

export const resetGoogleToken = async (
  _id: ObjectId,
  tokens: Auth.Credentials
) => {
  oauth2Client.setCredentials(tokens)
  // token is expired..
  const { credentials } = await oauth2Client.refreshAccessToken()
  await UserDao.updateGoogleTokens(_id, credentials)
  return credentials
}

export const checkGoogleAccessToken = async (
  _id: ObjectId,
  tokens: Auth.Credentials
) => {
  try {
    if (
      tokens?.expiry_date &&
      new Date(tokens.expiry_date).getTime() - new Date().getTime() < 0
    ) {
      const credentials = await resetGoogleToken(_id, tokens)
      tokens = credentials
      return credentials
    }
  } catch (err: any) {
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
