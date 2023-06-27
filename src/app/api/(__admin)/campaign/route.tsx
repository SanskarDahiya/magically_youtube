import { CampaignEventDao } from '@/serverComponent/DBWrapper'
import { AdminMiddleware } from '@/serverComponent/checkAdminAuthorization'
import type { NextRequest } from 'next/server'

async function postQuery(req: NextRequest) {
  try {
    const agg = await req.json()
    if (!Array.isArray(agg)) {
      throw new Error('Invalid Request')
    }
    const db = await CampaignEventDao.dbCollection()
    const existingUserResult = await db.aggregate(agg).toArray()

    return new Response(
      JSON.stringify(
        existingUserResult.map((a: any) => {
          let item: Partial<typeof a> = {}
          for (let entry in a) {
            const entryValue = a[entry]
            item[entry] = entryValue
            if (entryValue instanceof Date) {
              item[entry] =
                new Date(entryValue).toLocaleDateString() +
                '-' +
                new Date(entryValue).toLocaleTimeString()
            }
          }
          return item
        }),
        null,
        2
      )
    )
  } catch (err: any) {
    console.log('🚀 ~ file: route.tsx:35 ~ postQuery ~ err:', err)
    return new Response(
      JSON.stringify({
        code: err.code,
        message: err.message,
        stack: err.stack,
      }),
      { status: 518 }
    )
  }
}

export const POST = AdminMiddleware(postQuery)
