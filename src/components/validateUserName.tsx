'use server'

import { UserDao } from '@/serverComponent/DBWrapper'

const validateUserName = async (username: string | undefined) => {
  try {
    if (!username) return false
    const user = await UserDao.getByUsername(username)
    return !!user?.currentCampaignId
  } catch (err) {
    console.error(err, '<<validateUserName Failed')
  }
  return true
}

export default validateUserName
