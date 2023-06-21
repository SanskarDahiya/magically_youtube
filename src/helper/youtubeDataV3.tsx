import { Auth } from 'googleapis'
import { checkGoogleAccessToken } from './youtube_helper'
import { ObjectId } from 'mongodb'
import oauth2Client from '@/components/getGoogleAuth'
import { google } from 'googleapis'
import { googleServiceList } from '@/components/youtubeInterface'

const youtubeDataV3 = async (
  user: { _id: ObjectId; tokens: Auth.Credentials },
  { yt_query, yt_service }: { yt_query?: any; yt_service?: string }
) => {
  const newTokens = await checkGoogleAccessToken(user._id, user.tokens)

  oauth2Client.setCredentials(newTokens || user.tokens)
  const service = google.youtube('v3')
  if (!yt_service) {
    yt_service = 'channel'
  }

  yt_service =
    yt_service && googleServiceList.includes(yt_service)
      ? yt_service
      : 'channel'

  // @ts-ignore
  if (!service[yt_service]) {
    yt_service = 'channel'
  }

  // @ts-ignore
  const response = await service[yt_service].list({
    ...yt_query,
    auth: oauth2Client,
  })

  console.log(
    '🚀 ~ file: youtubeDataV3 ~ response:',
    JSON.stringify({ yt_service, yt_query: yt_query, resp: response.data })
  )
  return response
}

export default youtubeDataV3
