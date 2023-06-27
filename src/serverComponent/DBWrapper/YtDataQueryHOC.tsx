import {
  _getTime,
  _updateTime,
  getYTServiceTable,
} from '@/components/getMongoDb'
import type { ObjectId } from 'mongodb'

class YtDataQueryHOC {
  dbCollection = getYTServiceTable
  constructor() {}

  async update(_id: ObjectId, doc: any) {
    const db = await this.dbCollection()
    const { _id: DocDocId, _createdOn, ...restDoc } = doc
    return await db.findOneAndUpdate({ _id }, { $set: _updateTime(restDoc) })
  }

  async insert(doc: any) {
    const db = await this.dbCollection()
    return await db.insertOne(_getTime(doc))
  }
}

export default YtDataQueryHOC
