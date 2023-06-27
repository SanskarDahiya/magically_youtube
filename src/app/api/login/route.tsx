import { type NextRequest } from 'next/server'
import { getDeletedUserTable } from '@/components/getMongoDb'
import oauth2Client from '@/components/getGoogleAuth'
import { ObjectId } from 'mongodb'
import type { IUser } from '@/dbTypes'
import { fetchChannelList } from '@/helper/youtube_helper'
import { UserDao } from '@/serverComponent/DBWrapper'

export async function POST(request: NextRequest) {
  try {
    const res = await request.json()

    if (!res?.code) {
      throw new Error('Invalid Code')
    }
    const { tokens: data } = await oauth2Client.getToken(res?.code)
    let email
    if (!data.access_token || !data.refresh_token) {
      throw new Error('Invalid Request. Please Try Again later.')
    }

    if (data.access_token) {
      const UserInfo = await oauth2Client.getTokenInfo(data.access_token)
      email = UserInfo.email
    }

    if (data.scope?.search('youtube.readonly') === -1) {
      throw new Error('Please provide Youtube access to continue')
      return
    }
    // if (data.scope?.search('yt-analytics.readonly') === -1) {
    //   throw new Error('Youtube access is not provided')
    //   return
    // }
    // if (data.scope?.search('yt-analytics-monetary.readonly') === -1) {
    //   throw new Error('Youtube access is not provided')
    //   return
    // }

    if (!email) {
      throw new Error('Unable to get User Email')
    }

    const existingUserInfo = await UserDao.getByEmail(email)

    console.log(
      '🚀 ~ file: route.tsx:37 ~ POST ~ result:',
      JSON.stringify(existingUserInfo)
    )
    const thisDate = new Date()
    const newUserInfo: IUser = {
      _id: new ObjectId(),
      _createdOn: thisDate,
      _updatedOn: thisDate,
      email: email,
      ...existingUserInfo,
      // New info to update
      isAdmin: !!existingUserInfo?.isAdmin,
      raw_response: JSON.stringify(res),
      code: res?.code,
      lastLoginOn: thisDate,
      tokens: data,
      token_refresh_count: 0,
      token_refreshed_on: thisDate,
      isDeleted: false,
    }

    if (existingUserInfo) {
      await UserDao.update(existingUserInfo._id, newUserInfo)

      // Transfer All data into another table
      const db = await getDeletedUserTable()
      await db.insertOne({
        ...existingUserInfo,
        isDeleted: true,
        _id: new ObjectId(),
        _deletedOn: new Date(),
      })
    } else {
      await UserDao.insert(newUserInfo)
    }

    {
      // Fetch & add Channel Name
      if (!newUserInfo.ytChannel) {
        const channelList = await fetchChannelList(newUserInfo as IUser)
        if (channelList[0]?.id) {
          newUserInfo.ytChannel = channelList[0]
          await UserDao.update(newUserInfo._id, { ytChannel: channelList[0] })
        }
      }
    }

    return new Response(UserDao.populateSuccess(newUserInfo))
  } catch (err: any) {
    console.log('🚀 ~ file: route.tsx:96 ~ POST ~ err:', err)
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
