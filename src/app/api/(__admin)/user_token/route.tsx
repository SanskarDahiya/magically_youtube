import { getClientDb } from '@/components/getMongoDb'
import { logError } from '@/helper/axiomLogger'
import { UserDao } from '@/serverComponent/DBWrapper'
import { AdminMiddleware } from '@/serverComponent/checkAdminAuthorization'
import { ObjectId } from 'mongodb'
import type { NextRequest } from 'next/server'

async function getQuery() {
  try {
    const db = await getClientDb()
    const existingUserResult = await db
      .collection('user_tokens')
      .find()
      .sort({ lastLoginOn: -1 })
      .toArray()

    return new Response(
      JSON.stringify(
        existingUserResult.map((a) => {
          a.tokens = undefined
          a.code = undefined
          a.raw_response = undefined
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
    logError('🚀 ~ file: route.tsx:17 ~ GET ~ err:', err)
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

async function postQuery(req: NextRequest) {
  try {
    const requestBody = await req.json()
    if (!requestBody || !requestBody?._id) {
      throw new Error('Invalid Request')
    }

    const db = await UserDao.dbCollection()
    const oldUserResult = await db.findOne({
      _id: new ObjectId(requestBody._id),
    })

    if (!oldUserResult) {
      throw new Error('Invalid Request')
    }

    await UserDao.update(new ObjectId(requestBody._id), requestBody)

    const existingUserResult = await db.findOne({
      _id: new ObjectId(requestBody._id),
    })

    return new Response(
      JSON.stringify(
        [oldUserResult, existingUserResult].map((a: any) => {
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
    logError('🚀 ~ file: route.tsx:17 ~ GET ~ err:', err)
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

export const GET = AdminMiddleware(getQuery)
