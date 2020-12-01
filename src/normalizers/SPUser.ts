import { IUserModel } from '../protocols'
import { SPGroupNormalizer } from './SPGroup'

export const SPUserNormalizer = (
  spUser: any,
  profile_picture: string = ''
): IUserModel => ({
  id: spUser.Id,
  email: spUser.Email,
  title: spUser.Title,
  username: spUser.LoginName,
  groups: spUser.Groups.map(SPGroupNormalizer),
  profile_picture,
})
