import type { NextRequest } from 'next/server'
import { UserDao } from './DBWrapper'

export const AdminMiddleware = (
  callbackMethod: (req: NextRequest) => Promise<Response>
) => {
  return async (req: NextRequest) => {
    const a = req.headers.get('Authorization')
    if (typeof a !== 'string' || !a.trim()) {
      return new Response('Unauthorized', { status: 401 })
    }
    const isAdminUser = await UserDao.getByEmail(a)
    if (isAdminUser?.isAdmin !== true) {
      return new Response('Unauthorized', { status: 401 })
    }
    return callbackMethod(req)
  }
}
