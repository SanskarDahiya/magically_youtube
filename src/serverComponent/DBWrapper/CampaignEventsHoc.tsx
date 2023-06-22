import {
  _getTime,
  _updateTime,
  getCampaignMappingTable,
} from '@/components/getMongoDb'
import { ICampaignMapping } from '@/dbTypes'
import { ObjectId } from 'mongodb'

class CampaignEventsHoc {
  dbCollection = getCampaignMappingTable
  constructor() {}

  async update(_id: ObjectId, doc: Partial<ICampaignMapping>) {
    const db = await this.dbCollection()
    const { _id: DocId, ...restUser } = doc
    return await db.findOneAndUpdate({ _id }, { $set: _updateTime(restUser) })
  }

  async insert(doc: ICampaignMapping) {
    const db = await this.dbCollection()
    return await db.insertOne(_getTime(doc))
  }

  populateSuccess(doc: Partial<ICampaignMapping>) {
    return JSON.stringify({
      success: true,
      ...doc,
    })
  }
}

export default CampaignEventsHoc
