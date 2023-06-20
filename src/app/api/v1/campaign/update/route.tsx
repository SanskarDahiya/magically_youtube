import { type NextRequest } from 'next/server'
import {
  _getTime,
  _updateTime,
  getCampaignMappingTable,
  getUserTable,
} from '@/components/getMongoDb'
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
    const userDb = await getUserTable()
    const campaignMapDb = await getCampaignMappingTable()

    const user = await userDb.findOne({ username: streamerUsername })
    if (!user) {
      throw new Error('Invalid Streamer')
    }

    const CampaignId = new ObjectId('6491795bdf1faef3505e512b') // loco-web-testing
    // Later will be fetched from user collection
    const { isLive, stats, channelIds, videoIds } = await fetchYTLiveStats(user)
    const DataToInsert = {
      userId: user._id,
      userEmail: user.email,
      username: user.username,
      campaignId: CampaignId,
      isActive: isActive,
      eventFiredOn: new Date(timestamp),
      isLiveVideoPresent: !!isLive,
      live_stats: stats,
      yt_info: { channelIds, videoIds },
    }

    await campaignMapDb.insertOne(_getTime(DataToInsert))

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
