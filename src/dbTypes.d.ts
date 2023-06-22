import { Auth } from 'googleapis'
import { ObjectId } from 'mongodb'

interface defaultValues {
  _id: ObjectId
  _createdOn: Date
  _updatedOn: Date
}

export interface IUser extends defaultValues {
  email: string
  raw_response: string
  code: string
  tokens: Auth.Credentials
  isDeleted: boolean
  lastLoginOn: Date
  isAdmin: boolean
  username?: string
  token_refresh_count?: number
  token_refreshed_on?: Date
  ytChannel?: {
    id?: string | null
    country?: string | null
    customUrl?: string | null
    description?: string | null
    title?: string | null
  }
}
