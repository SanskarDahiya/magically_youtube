import {
  _getTime,
  _updateTime,
  getCampaignTable,
} from '@/components/getMongoDb'
import type { ICampaign } from '@/dbTypes'
import type { ObjectId } from 'mongodb'

class CampaignHoc {
  dbCollection = getCampaignTable
  constructor() {}

  async update(_id: ObjectId, doc: Partial<ICampaign>) {
    const db = await this.dbCollection()
    const { _id: DocId, ...restUser } = doc
    return await db.findOneAndUpdate({ _id }, { $set: _updateTime(restUser) })
  }

  async insert(doc: ICampaign) {
    const db = await this.dbCollection()
    return await db.insertOne(_getTime(doc))
  }

  populateSuccess(doc: Partial<ICampaign>) {
    return JSON.stringify({
      success: true,
      ...doc,
    })
  }
}

export default CampaignHoc
