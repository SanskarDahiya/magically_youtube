import type { IUser } from '@/dbTypes'
import { MongoClient, ServerApiVersion } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  if (!globalWithMongo._mongoClientPromise) {
    throw new Error('Unable to create mongodb instance')
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

let clientWithoutPromise: MongoClient
// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.

const getClient = async () => {
  if (!clientWithoutPromise) {
    clientWithoutPromise = await clientPromise
  }

  return clientWithoutPromise
}

export default getClient

export const getClientDb = async () => {
  const client = await getClient()
  return client.db('loco_test')
}

export const getUserTable = async () => {
  const db = await getClientDb()
  return db.collection<IUser>('user_tokens')
}

export const getYTServiceTable = async () => {
  const db = await getClientDb()
  return db.collection('yt_data_mapping')
}

export const getDeletedUserTable = async () => {
  const db = await getClientDb()
  return db.collection<IUser & { _deletedOn: Date }>('deleted_user_tokens')
}
export const getCampaignTable = async () => {
  const db = await getClientDb()
  return db.collection('campaign_tokens')
}
export const getCampaignMappingTable = async () => {
  const db = await getClientDb()
  return db.collection('campaign_details')
}

export function _updateTime<T>(obj: Partial<T>): any {
  return {
    ...obj,
    _updatedOn: new Date(),
  }
}
export function _getTime<T>(obj: Partial<T>): any {
  return {
    ...obj,
    _createdOn: new Date(),
    _updatedOn: new Date(),
  }
}
