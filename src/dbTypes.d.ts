import { Auth } from 'googleapis'
import { ObjectId } from 'mongodb'

interface defaultValues {
  _id: ObjectId
  _createdOn: Date
  _updatedOn: Date
}

export interface ICampaignMappingLiveStats {
  liveStreamingDetails?: {
    activeLiveChatId?: string | null
    actualEndTime?: string | null
    actualStartTime?: string | null
    concurrentViewers?: string | null
    scheduledEndTime?: string | null
    scheduledStartTime?: string | null
  }
  status?: {
    embeddable?: boolean | null
    failureReason?: string | null
    license?: string | null
    madeForKids?: boolean | null
    privacyStatus?: string | null
    publicStatsViewable?: boolean | null
    publishAt?: string | null
    rejectionReason?: string | null
    selfDeclaredMadeForKids?: boolean | null
    uploadStatus?: string | null
  }
  streamInfo?: {
    categoryId?: string | null
    channelId?: string | null
    channelTitle?: string | null
    defaultAudioLanguage?: string | null
    defaultLanguage?: string | null
    description?: string | null
    liveBroadcastContent?: string | null
    localized?: { description?: string | null; title?: string | null }
    publishedAt?: string | null
    tags?: string[] | null
    thumbnails?: {
      height?: number | null
      url?: string | null
      width?: number | null
    }
    title?: string | null
  }
  statistics?: {
    concurrentViewers?: number
    commentCount?: number
    dislikeCount?: number
    favoriteCount?: number
    likeCount?: number
    viewCount?: number
  }
}

export interface ICampaign extends defaultValues {
  name: string
  startDate: Date
  duration: number
  // and many more
}

export interface ICampaignMapping extends defaultValues {
  userId: ObjectId
  campaignId: ObjectId
  userEmail: string
  isActive: boolean
  eventFiredOn: Date
  isLiveVideoPresent: boolean
  channelId?: string | null
  videoId?: string | null
  live_stats: null | ICampaignMappingLiveStats
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
  currentCampaignId?: ObjectId | null
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

export interface ICampaign extends defaultValues {
  name: string
  startDate: Date
  duration: number
}
