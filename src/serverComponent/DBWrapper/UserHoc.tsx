import { _getTime, _updateTime, getUserTable } from '@/components/getMongoDb'
import { IUser } from '@/dbTypes'
import { ObjectId } from 'mongodb'

class UserHoc {
  constructor() {}

  async update(_id: ObjectId, user: Partial<IUser>) {
    const db = await getUserTable()
    const { _id: UserDocId, ...restUser } = user
    return await db.findOneAndUpdate({ _id }, { $set: _updateTime(restUser) })
  }

  async insert(user: IUser) {
    const db = await getUserTable()
    return await db.insertOne(_getTime(user))
  }

  async markUserInActive(_ids: ObjectId[]) {
    const db = await getUserTable()
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
    const db = await getUserTable()
    const result = await db.findOne({ email, isDeleted: false })

    return result
  }

  async getByEmail(email: string) {
    const db = await getUserTable()
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
