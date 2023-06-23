import { _getTime, _updateTime, getUserTable } from '@/components/getMongoDb'
import type { IUser } from '@/dbTypes'
import type { Auth } from 'googleapis'
import type { ObjectId } from 'mongodb'

class UserHoc {
  dbCollection = getUserTable
  constructor() {}

  async update(_id: ObjectId, user: Partial<IUser>) {
    const db = await this.dbCollection()
    const { _id: UserDocId, _createdOn, ...restUser } = user
    return await db.findOneAndUpdate({ _id }, { $set: _updateTime(restUser) })
  }

  async insert(user: IUser) {
    const db = await this.dbCollection()
    return await db.insertOne(_getTime(user))
  }

  async updateGoogleTokens(_id: ObjectId, tokens: Auth.Credentials) {
    const db = await this.dbCollection()

    return await db.findOneAndUpdate(
      { _id },
      {
        $set: _updateTime({
          tokens: tokens,
          token_refreshed_on: new Date(),
        }),
        $inc: { token_refresh_count: 1 },
      }
    )
  }
  async markUserInActive(_ids: ObjectId[]) {
    const db = await this.dbCollection()
    const result = await Promise.allSettled(
      _ids.map((_id) => {
        return db.findOneAndUpdate(
          { _id },
          { $set: _updateTime<IUser>({ isDeleted: true }) }
        )
      })
    )
    return result
  }

  async getActiveUserByEmail(email: string) {
    if (!email?.trim()) return null
    const db = await this.dbCollection()
    const result = await db.findOne({ email, isDeleted: false })

    return result
  }

  async getByUsername(username: string) {
    if (!username?.trim()) return null
    const db = await this.dbCollection()
    const result = await db.findOne({ username })
    return result
  }
  async getByEmail(email: string) {
    if (!email?.trim()) return null
    const db = await this.dbCollection()
    const result = await db.findOne({ email })

    return result
  }

  populateSuccess(user: Partial<IUser>) {
    // Params not needed to pass
    const {
      _id,
      tokens,
      code,
      raw_response,
      isDeleted,
      isAdmin,
      _createdOn,
      _updatedOn,
      token_refresh_count,
      token_refreshed_on,
      ...rest
    } = user

    return JSON.stringify({
      success: true,
      isAdmin: isAdmin || undefined, // to remove this field, if not present
      ...rest,
    })
  }
}

export default UserHoc
