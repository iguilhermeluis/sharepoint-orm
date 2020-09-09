import { AxiosInstance, AxiosResponse, Method } from 'axios'
import { IConfig } from './IConfig'

export type TInstance = 'sp' | 'SP' | 'api' | 'API'

export interface IClient {
  readonly clientConfig: IConfig

  request(
    instance: TInstance,
    method: Method,
    path: string,
    headers?: object,
    params?: object
  ): Promise<AxiosResponse>
}
