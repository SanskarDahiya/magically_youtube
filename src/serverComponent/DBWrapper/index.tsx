import UserHoc from './UserHoc'
import CampaignEventsHoc from './CampaignEventsHoc'
import CampaignHoc from './CampaignHoc'
import YtDataQueryHOC from './YtDataQueryHOC'

export const CampaignDao = new CampaignHoc()
export const CampaignEventDao = new CampaignEventsHoc()
export const UserDao = new UserHoc()
export const YtDataQueryDao = new YtDataQueryHOC()
