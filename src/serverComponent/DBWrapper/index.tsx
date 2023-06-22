import UserHoc from './UserHoc'
import CampaignEventsHoc from './CampaignEventsHoc'
import CampaignHoc from './CampaignHoc'

export const CampaignDao = new CampaignHoc()
export const CampaignEventDao = new CampaignEventsHoc()
export const UserDao = new UserHoc()
