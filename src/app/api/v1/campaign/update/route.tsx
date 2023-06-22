import { type NextRequest } from 'next/server'
import { fetchYTLiveStats } from '@/helper/youtube_helper'
import { CampaignEventDao, UserDao } from '@/serverComponent/DBWrapper'
import { ICampaignMapping } from '@/dbTypes'
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

    const user = await UserDao.getByUsername(streamerUsername)
    if (!user) {
      throw new Error('Invalid Streamer')
    }

    const CampaignId =
      user.currentCampaignId || new ObjectId('6491795bdf1faef3505e512b') // loco-web-testing
    // Later will be fetched from user collection
    const { isLive, stats } = await fetchYTLiveStats(user)
    const DataToInsert: ICampaignMapping = {
      _id: new ObjectId(),
      _createdOn: new Date(),
      _updatedOn: new Date(),
      userId: user._id,
      userEmail: user.email,
      campaignId: CampaignId,
      isActive: isActive,
      eventFiredOn: new Date(timestamp),
      isLiveVideoPresent: !!isLive,
      live_stats: stats,
    }

    await CampaignEventDao.insert(DataToInsert)

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
