import { IUser } from '@/dbTypes'

export const populateUserResponse = (user: IUser) => {
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

  return JSON.stringify({ success: true, ...rest })
}
