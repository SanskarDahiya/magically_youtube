import { type NextRequest } from 'next/server'
import { _getTime, _updateTime, getClientDb } from '@/components/getMongoDb'
import { fetchYTLiveStats } from '@/helper/youtube_helper'
import { ObjectId } from 'mongodb'

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

    const db = await getClientDb()
    const user = await db
      .collection('user_tokens')
      .findOne({ username: streamerUsername })
    if (!user) {
      throw new Error('Invalid Streamer')
    }

    const CampaignId = new ObjectId(162736353637)
    const { isLive, stats, channelIds, videoIds } = await fetchYTLiveStats(user)
    const DataToInsert = {
      request: JSON.stringify(responseBody),
      userId: user._id,
      campaignId: CampaignId,
      isActive: isActive,
      eventFiredOn: timestamp,
      isLive: !!isLive,
      live_stats: stats,
      yt_info: { channelIds, videoIds },
    }

    await db.collection('campaign_details').insertOne(_getTime(DataToInsert))

    return new Response(
      JSON.stringify({
        success: true,
      })
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
