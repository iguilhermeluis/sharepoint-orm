import { IClient, IUser, IUserModel } from '../protocols'
import { SPUserNormalizer } from '../normalizers'
import { Builder } from '../builder'
import { GetProfilePictureUrlStrategy } from '../strategies/auth/profile-picture'

export const AuthorizationKey = (isRequestDigest?: boolean) =>
  (
    typeof isRequestDigest === 'undefined'
      ? Builder.requestDigest()
      : isRequestDigest
  )
    ? 'X-REQUESTDIGEST'
    : 'Authorization'

export class User implements IUser {
  private readonly client: IClient
  constructor(client: IClient) {
    this.client = client
  }

  async authorize(requestDigestToken?: string): Promise<string> {
    if (requestDigestToken) {
      Builder.requestDigest(true)
      return Builder.authorization(requestDigestToken)
    }

    const { clientConfig } = this.client
    const { data: access_token } = await this.client.request('API', 'POST', ``)
    return Builder.authorization(`Bearer ${access_token.toString()}`)
  }

  async refreshToken(): Promise<string> {
    const {
      data: { FormDigestValue: token },
    } = await this.client.request('SP', 'GET', `/_api/contextinfo`, {
      [AuthorizationKey()]: Builder.authorization(),
    })

    return Builder.authorization(token)
  }

  async current(token?: string): Promise<IUserModel> {
    const { data: spUser } = await this.client.request(
      'SP',
      'GET',
      '/_api/web/currentuser/?$expand=groups',
      {
        [AuthorizationKey()]: token || Builder.authorization(),
      }
    )

    return SPUserNormalizer(
      spUser,
      GetProfilePictureUrlStrategy(this.client.clientConfig.spUrl, spUser.email)
    )
  }

  async impersonate(userId: string): Promise<IUserModel> {
    const { data: spUser } = await this.client.request(
      'SP',
      'GET',
      `/_api/Web/GetUserById(${userId})?$expand=Groups`,
      {
        [AuthorizationKey()]: Builder.authorization(),
      }
    )

    return SPUserNormalizer(
      spUser,
      GetProfilePictureUrlStrategy(this.client.clientConfig.spUrl, spUser.email)
    )
  }
}
