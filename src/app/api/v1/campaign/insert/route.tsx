import type { NextRequest } from 'next/server'
import { CampaignDao, UserDao } from '@/serverComponent/DBWrapper'

export async function PUT(request: NextRequest) {
  try {
    const responseBody = await request.json()
    const userEmail = responseBody.email
    if (!userEmail) {
      throw new Error('Invalid Request')
    }
    const user = await UserDao.getByEmail(userEmail)
    if (user?.isAdmin !== true) {
      throw new Error('UnAuthorized')
    }

    await CampaignDao.insert(responseBody)
    return new Response(
      JSON.stringify({
        success: true,
        _data: responseBody,
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
