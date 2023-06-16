import { ObjectId } from 'mongodb'
import { Auth } from 'googleapis'
import oauth2Client from '@/components/getGoogleAuth'
import { _updateTime, getClientDb } from '@/components/getMongoDb'

export const checkGoogleAccessToken = async (
  id: ObjectId,
  tokens: Auth.Credentials
): Promise<Auth.Credentials> => {
  oauth2Client.setCredentials(tokens)
  try {
    if (
      tokens.expiry_date &&
      new Date(tokens.expiry_date).getTime() - new Date().getTime() < 0
    ) {
      // token is expired..
      const { credentials } = await oauth2Client.refreshAccessToken()
      tokens = credentials
      const db = await getClientDb()
      await db.collection('user_tokens').findOneAndUpdate(
        { _id: id },
        {
          $set: _updateTime({
            tokens: credentials,
            token_refreshed_on: new Date(),
          }),
          $inc: { token_refresh_count: 1 },
        }
      )

      return credentials
    }
  } catch (err: unknown) {
    // @ts-ignore
    const errMEssage = err?.message || 'Invalid Token Grant'
    if (errMEssage === 'invalid_grant') {
      // @ts-ignore
      throw new Error('Token has been revoked.')
    }
    throw new Error(errMEssage)
  }
  return tokens
}