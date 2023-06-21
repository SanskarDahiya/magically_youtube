import { type NextRequest } from 'next/server'
import {
  _getTime,
  _updateTime,
  getDeletedUserTable,
  getUserTable,
} from '@/components/getMongoDb'
import oauth2Client from '@/components/getGoogleAuth'
import { ObjectId } from 'mongodb'
import { IUser, IUser_DB } from '@/dbTypes'
import { fetchChannelList } from '@/helper/youtube_helper'
import { populateUserResponse } from '@/helper/populateResponse'

export async function POST(request: NextRequest) {
  try {
    const res = await request.json()

    if (!res?.code) {
      throw new Error('Invalid Code')
    }
    const userDb = await getUserTable()
    const { tokens: data } = await oauth2Client.getToken(res?.code)
    let email
    if (!data.access_token || !data.refresh_token) {
      throw new Error('Invalid Request. Please Try Again later.')
    }

    if (data.access_token) {
      const UserInfo = await oauth2Client.getTokenInfo(data.access_token)
      email = UserInfo.email
    }

    // if (data.scope?.search('youtube.readonly') === -1) {
    //   throw new Error('Youtube access is not provided')
    //   return
    // }
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

    const existingUserResult = (await userDb.findOne({
      email: email,
    })) as IUser_DB

    console.log(
      '🚀 ~ file: route.tsx:37 ~ POST ~ result:',
      JSON.stringify(existingUserResult)
    )

    const userInformation = {
      _id: new ObjectId(),
      ...existingUserResult,
      email: email,
      code: res?.code,
      tokens: data,
      isDeleted: false,
      raw_response: JSON.stringify(res),
      lastLoginOn: new Date(),
      isAdmin: !!existingUserResult?.isAdmin,
      token_refresh_count: 0,
      token_refreshed_on: new Date(),
    }

    if (existingUserResult) {
      await userDb.findOneAndUpdate(
        { _id: existingUserResult._id },
        { $set: _updateTime(userInformation) }
      )

      // Transfer All data into another table
      const db = await getDeletedUserTable()
      await db.insertOne({
        ...existingUserResult,
        isDeleted: true,
        _id: new ObjectId(),
        _deletedOn: new Date(),
      })
    } else {
      await userDb.insertOne(_getTime(userInformation))
    }

    {
      // Fetch & add Channel Name
      if (!userInformation.ytChannel) {
        const channelList = await fetchChannelList(userInformation as IUser)
        if (channelList[0]?.id) {
          userInformation.ytChannel = channelList[0]
          await userDb.findOneAndUpdate(
            { _id: userInformation._id },
            { $set: _updateTime({ ytChannel: channelList[0] }) }
          )
        }
      }
    }

    return new Response(populateUserResponse(userInformation as IUser))
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
